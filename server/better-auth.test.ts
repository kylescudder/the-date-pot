// Better Auth against a disposable PostgreSQL database: sign-in methods, open
// sign-up, mail protections, redirect safety, the route allowlist, profile
// photos, member provisioning, Clerk linking and Clerk-mode parity.
import { afterAll, beforeAll, expect, test } from 'bun:test'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import sharp from 'sharp'
import { database, migrate, orm, type Database } from '../src/server/db'
import { createDatePotAuth } from '../src/server/auth-factory'
import { createAuthRouteHandler } from '../src/server/auth-route'
import { betterAuthIdentity, resolveAppUser } from '../src/server/app-user'
import { createTrpcHandler } from '../src/server/trpc-handler'
import { createProfileHandler } from '../src/server/profile-handler'
import { createApp, requestBodyLimit, serverBodyLimit } from './app'
import {
  applyEmailOverrides,
  linkClerkUsers,
  listClerkUsers,
  parseEmailOverrides,
  verifiedPrimaryEmail
} from '../deploy/link-clerk-users'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../src/server/db/schema'

if (!process.env.TEST_DATABASE_URL)
  throw new Error(
    'TEST_DATABASE_URL must identify a disposable test PostgreSQL service'
  )
const admin = postgres(process.env.TEST_DATABASE_URL, {
  max: 1,
  onnotice: () => {}
})
const name = 'datepot_auth_' + randomUUID().replaceAll('-', '').slice(0, 10)
const origin = 'https://thedatepot.auth.test'
const secret = randomUUID() + randomUUID()
const kyleId = '22222222-2222-4222-8222-222222222221'
const kyleClerk = 'user_kyle_fixture'
let sql: Database
let fixtureNumber = 0

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE "${name}"`)
  const url = new URL(process.env.TEST_DATABASE_URL!)
  url.pathname = '/' + name
  sql = database(url.toString())
  // Production predates the auth tables: seed existing members first, then add
  // the Better Auth migration on top of their rows.
  await migrate(sql)
  await sql.unsafe(
    readFileSync(
      new URL('../tests/fixtures/seed.sql', import.meta.url),
      'utf8'
    ).replaceAll('user_3LFVN7yEgn8eAU4XqJzSXvo2oqd', kyleClerk)
  )
})

afterAll(async () => {
  await sql.end({ timeout: 1 })
  await admin.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
  await admin.end()
})

async function resetAuth() {
  await sql`UPDATE "user" SET auth_user_id = NULL`
  await sql`DELETE FROM "userGroups" WHERE "userId" IN (SELECT id FROM "user" WHERE "clerkId" IS NULL)`
  await sql`DELETE FROM "user" WHERE "clerkId" IS NULL`
  await sql`DELETE FROM auth_user`
  await sql`DELETE FROM auth_verification`
  await sql`DELETE FROM auth_rate_limit`
  await sql`DELETE FROM auth_email_limit`
}

async function authFixture({
  allowedEmails = [] as string[],
  dailyEmailLimit = 40
} = {}) {
  await resetAuth()
  const db = orm(sql)
  const codes = new Map<string, string>()
  const links: { email: string; kind: string; url: string }[] = []
  const auth = createDatePotAuth(
    db,
    { baseURL: origin, secret, allowedEmails, dailyEmailLimit },
    async (email, otp) => {
      codes.set(email, otp)
    },
    async (email, kind, url) => {
      links.push({ email, kind, url })
    }
  )
  const ip = `203.0.113.${++fixtureNumber}`
  const request = (
    path: string,
    body?: unknown,
    cookie = '',
    extra: Record<string, string> = {}
  ) =>
    auth.handler(
      new Request(origin + '/api/auth' + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          Origin: origin,
          'Content-Type': 'application/json',
          'CF-Connecting-IP': ip,
          Cookie: cookie,
          ...extra
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      })
    )
  const trpc = createTrpcHandler(
    db,
    betterAuthIdentity(db, auth, allowedEmails),
    async () => [],
    'better-auth'
  )
  const call = async (procedure: string, cookie: string) => {
    const response = await trpc(
      new Request(origin + '/api/trpc/' + procedure, {
        headers: { Cookie: cookie }
      })
    )
    const body = await response.json()
    return { status: response.status, data: body.result?.data?.json }
  }
  return { auth, db, codes, links, request, call, ip }
}

function mergeCookies(response: Response, prior = '') {
  const values = new Map(
    prior
      .split('; ')
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        return [part.slice(0, index), part.slice(index + 1)]
      })
  )
  for (const value of response.headers.getSetCookie()) {
    const pair = value.split(';')[0]
    const index = pair.indexOf('=')
    values.set(pair.slice(0, index), pair.slice(index + 1))
  }
  return [...values].map(([key, value]) => key + '=' + value).join('; ')
}

async function signInWithCode(
  fixture: Awaited<ReturnType<typeof authFixture>>,
  email: string
) {
  const sent = await fixture.request('/email-otp/send-verification-otp', {
    email,
    type: 'sign-in'
  })
  expect(sent.status).toBe(200)
  const response = await fixture.request('/sign-in/email-otp', {
    email,
    otp: fixture.codes.get(email.trim().toLowerCase())
  })
  expect(response.status).toBe(200)
  return {
    cookie: mergeCookies(response),
    user: (await response.clone().json()).user as { id: string; email: string }
  }
}

test('the migration is additive: existing members keep their rows and Clerk ids', async () => {
  const [kyle] =
    await sql`SELECT id, name, username, "clerkId", auth_user_id FROM "user" WHERE id = ${kyleId}`
  expect(kyle).toEqual({
    id: kyleId,
    name: 'Test Kyle',
    username: 'testkyle',
    clerkId: kyleClerk,
    auth_user_id: null
  })
  const columns = await sql`
    SELECT column_name, is_nullable FROM information_schema.columns
    WHERE table_name = 'user' AND column_name IN ('clerkId', 'auth_user_id')
    ORDER BY column_name`
  expect(columns.map((row) => [row.column_name, row.is_nullable])).toEqual([
    ['auth_user_id', 'YES'],
    ['clerkId', 'YES']
  ])
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE tablename LIKE 'auth\\_%' ORDER BY 1`
  expect(tables.map((row) => row.tablename)).toEqual([
    'auth_account',
    'auth_email_limit',
    'auth_passkey',
    'auth_rate_limit',
    'auth_session',
    'auth_user',
    'auth_verification'
  ])
})

test('email-code sign-in is hashed and single-use, and a new member gets a row and a pot of their own', async () => {
  const fixture = await authFixture()
  const sent = await fixture.request('/email-otp/send-verification-otp', {
    email: ' New.Person@Example.com ',
    type: 'sign-in'
  })
  expect(sent.status).toBe(200)
  const otp = fixture.codes.get('new.person@example.com')!
  expect(otp).toMatch(/^\d{6}$/)
  const [stored] = await sql`SELECT identifier, value FROM auth_verification`
  expect(stored.identifier).toBe('sign-in-otp-new.person@example.com')
  expect(stored.value).toBe(
    createHmac('sha256', secret)
      .update('datepot-email-otp:' + otp)
      .digest('hex') + ':0'
  )
  const signedIn = await fixture.request('/sign-in/email-otp', {
    email: 'new.person@example.com',
    otp
  })
  expect(signedIn.status).toBe(200)
  const cookies = signedIn.headers.getSetCookie().join(';')
  expect(cookies).toMatch(/__Secure-datepot-auth\.session_token=/)
  expect(cookies).toMatch(/HttpOnly/i)
  expect(cookies).toMatch(/SameSite=Lax/i)
  expect(cookies).not.toMatch(/Domain=/i)
  const cookie = mergeCookies(signedIn)
  // Concurrent first requests still provision exactly one member.
  const [first, second] = await Promise.all([
    fixture.call('users.me', cookie),
    fixture.call('users.me', cookie)
  ])
  expect(first.status).toBe(200)
  expect(second.data).toEqual(first.data)
  const rows = await sql`
    SELECT u.name, u.username, u."clerkId", u.bio, g."groupId"
    FROM "user" u JOIN "userGroups" g ON g."userId" = u.id
    WHERE u.auth_user_id = ${(await signedIn.json()).user.id}`
  expect([...rows]).toEqual([
    {
      name: 'new.person',
      username: 'new.person@example.com',
      clerkId: null,
      bio: '',
      groupId: first.data.groupId
    }
  ])
  // Their pot starts empty and never shows another group's records.
  expect((await fixture.call('beer.list', cookie)).data).toEqual([])
  // Codes are single-use.
  expect(
    (
      await fixture.request('/sign-in/email-otp', {
        email: 'new.person@example.com',
        otp
      })
    ).status
  ).toBe(400)
  expect((await fixture.request('/sign-out', {}, cookie)).status).toBe(200)
  expect((await fixture.call('users.me', cookie)).status).toBe(401)
})

test('mail has a per-recipient cooldown and an app-wide budget', async () => {
  const fixture = await authFixture({ dailyEmailLimit: 2 })
  const send = (email: string) =>
    fixture.request('/email-otp/send-verification-otp', {
      email,
      type: 'sign-in'
    })
  expect((await send('a@example.com')).status).toBe(200)
  // A throttled recipient gets the same answer as any address that gets no mail.
  expect((await send('A@example.com')).status).toBe(200)
  expect(fixture.codes.size).toBe(1)
  expect((await send('b@example.com')).status).toBe(200)
  // Clear the per-IP endpoint limit (3 a minute) so only the mail budget applies.
  await sql`DELETE FROM auth_rate_limit`
  // The third recipient hits the app-wide daily budget.
  expect((await send('c@example.com')).status).toBe(429)
  expect([...fixture.codes.keys()]).toEqual(['a@example.com', 'b@example.com'])
  await sql`DELETE FROM auth_rate_limit`
  const cross = await fixture.request(
    '/email-otp/send-verification-otp',
    { email: 'd@example.com', type: 'sign-in' },
    '',
    { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' }
  )
  expect(cross.status).toBe(403)
})

test('a throttled allowlisted address gets the same answer as an unlisted one', async () => {
  const fixture = await authFixture({ allowedEmails: ['admin@example.com'] })
  const endpoints = [
    ['/email-otp/send-verification-otp', { type: 'sign-in' }],
    ['/sign-in/magic-link', { callbackURL: '/' }],
    ['/request-password-reset', { redirectTo: '/auth/reset-password' }]
  ] as const
  const answer = async (path: string, extra: object, email: string) => {
    // Keep the per-IP endpoint limit out of the comparison.
    await sql`DELETE FROM auth_rate_limit`
    const response = await fixture.request(path, { email, ...extra })
    return { status: response.status, body: await response.text() }
  }
  expect(
    (await answer(endpoints[0][0], endpoints[0][1], 'admin@example.com')).status
  ).toBe(200)
  const code = fixture.codes.get('admin@example.com')
  expect(code).toBeTruthy()
  for (const [path, extra] of endpoints) {
    const throttled = await answer(path, extra, 'admin@example.com')
    const unlisted = await answer(path, extra, 'stranger@example.com')
    expect(throttled, path).toEqual(unlisted)
    expect(throttled.status, path).toBe(200)
  }
  // Nothing more was sent or charged, and the first code still works.
  expect(fixture.links.length).toBe(0)
  expect(fixture.codes.get('admin@example.com')).toBe(code)
  const [global] =
    await sql`SELECT count FROM auth_email_limit WHERE key = 'global:day'`
  expect(global.count).toBe(1)
  await sql`DELETE FROM auth_rate_limit`
  expect(
    (
      await fixture.request('/sign-in/email-otp', {
        email: 'admin@example.com',
        otp: code
      })
    ).status
  ).toBe(200)
})

test('with open sign-up, a throttled address looks like one that gets no mail', async () => {
  const fixture = await authFixture()
  const throttle = async (email: string) => {
    const recipient = createHash('sha256').update(email).digest('hex')
    await sql`INSERT INTO auth_email_limit (key, count, window_started_at) VALUES (${`recipient:${recipient}:minute`}, 1, now())`
  }
  // An address with an account and a used-up cooldown, against one with no account.
  await signInWithCode(fixture, 'member@example.com')
  await sql`DELETE FROM auth_rate_limit`
  const reset = async (email: string) => {
    await sql`DELETE FROM auth_rate_limit`
    const response = await fixture.request('/request-password-reset', {
      email,
      redirectTo: '/auth/reset-password'
    })
    return { status: response.status, body: await response.text() }
  }
  const throttled = await reset('member@example.com')
  expect(throttled).toEqual(await reset('nobody@example.com'))
  expect(throttled.status).toBe(200)
  expect(fixture.links.length).toBe(0)
  // A sign-up whose confirmation email is throttled still answers as usual,
  // sends nothing and spends nothing.
  await sql`DELETE FROM auth_email_limit`
  await throttle('newbie@example.com')
  await sql`DELETE FROM auth_rate_limit`
  const signUp = await fixture.request('/sign-up/email', {
    email: 'newbie@example.com',
    password: 'correct horse battery staple',
    name: 'Newbie'
  })
  expect(signUp.status).toBe(200)
  expect(fixture.links.length).toBe(0)
  expect(
    (await sql`SELECT key FROM auth_email_limit WHERE key = 'global:day'`)
      .length
  ).toBe(0)
})

test('requests that send no email do not spend the shared mail budget', async () => {
  const fixture = await authFixture({ dailyEmailLimit: 1 })
  // Open sign-up has no allowlist, so these reach Better Auth, which sends
  // nothing for addresses without an account.
  for (const email of [
    'ghost1@example.com',
    'ghost2@example.com',
    'ghost3@example.com'
  ]) {
    await sql`DELETE FROM auth_rate_limit`
    expect(
      (
        await fixture.request('/request-password-reset', {
          email,
          redirectTo: '/auth/reset-password'
        })
      ).status
    ).toBe(200)
  }
  await sql`DELETE FROM auth_rate_limit`
  expect(
    (
      await fixture.request('/send-verification-email', {
        email: 'ghost4@example.com',
        callbackURL: '/'
      })
    ).status
  ).toBe(200)
  expect(fixture.links.length).toBe(0)
  expect(
    (await sql`SELECT key FROM auth_email_limit WHERE key = 'global:day'`)
      .length
  ).toBe(0)
  // The one email the budget allows still goes to a real sign-in.
  await sql`DELETE FROM auth_rate_limit`
  await signInWithCode(fixture, 'member@example.com')
})

test('with AUTH_ALLOWED_EMAILS set, only listed addresses get mail or accounts, and removal revokes access', async () => {
  const fixture = await authFixture({ allowedEmails: ['member@example.com'] })
  for (const [path, body] of [
    [
      '/email-otp/send-verification-otp',
      { email: 'outsider@example.com', type: 'sign-in' }
    ],
    [
      '/sign-in/magic-link',
      { email: 'outsider@example.com', callbackURL: '/' }
    ],
    [
      '/request-password-reset',
      { email: 'outsider@example.com', redirectTo: '/auth/reset-password' }
    ]
  ] as const) {
    const response = await fixture.request(path, body)
    expect(response.status).toBe(200)
  }
  expect(fixture.codes.size).toBe(0)
  expect(fixture.links.length).toBe(0)
  expect((await sql`SELECT id FROM auth_verification`).length).toBe(0)
  const signUp = await fixture.request('/sign-up/email', {
    email: 'member@example.com',
    password: 'correct horse battery staple',
    name: 'Member'
  })
  expect(signUp.status).toBe(400)
  const { cookie } = await signInWithCode(fixture, 'member@example.com')
  expect((await fixture.call('users.me', cookie)).status).toBe(200)
  // The same session no longer authorizes once the address leaves the list.
  const narrowed = createTrpcHandler(
    fixture.db,
    betterAuthIdentity(fixture.db, fixture.auth, ['someone-else@example.com']),
    async () => [],
    'better-auth'
  )
  const revoked = await narrowed(
    new Request(origin + '/api/trpc/users.me', { headers: { Cookie: cookie } })
  )
  expect(revoked.status).toBe(401)
  const count =
    await sql`SELECT count(*)::int AS n FROM auth_user WHERE email = 'outsider@example.com'`
  expect(count[0].n).toBe(0)
})

test('open password sign-up requires a confirmed email and never reveals existing accounts', async () => {
  const fixture = await authFixture()
  const password = 'correct horse battery staple'
  for (const callbackURL of [
    'https://attacker.example/',
    '//attacker.example/'
  ])
    expect(
      (
        await fixture.request('/sign-up/email', {
          email: 'joiner@example.com',
          password,
          name: 'Joiner',
          callbackURL
        })
      ).status
    ).toBe(403)
  // Profile fields only: no client-chosen image or verification flag.
  expect(
    (
      await fixture.request('/sign-up/email', {
        email: 'joiner@example.com',
        password,
        name: 'Joiner',
        image: 'https://attacker.example/pixel.png'
      })
    ).status
  ).toBe(400)
  // Three refused attempts used this IP's sign-up allowance (3 a minute).
  await sql`DELETE FROM auth_rate_limit`
  const signUp = await fixture.request('/sign-up/email', {
    email: 'Joiner@Example.com',
    password,
    name: 'Joiner',
    callbackURL: '/'
  })
  expect(signUp.status).toBe(200)
  expect((await signUp.json()).token).toBeNull()
  expect(fixture.links.map(({ email, kind }) => [email, kind])).toEqual([
    ['joiner@example.com', 'verify-email']
  ])
  // Unconfirmed accounts cannot sign in with their password.
  const early = await fixture.request('/sign-in/email', {
    email: 'joiner@example.com',
    password
  })
  expect(early.status).toBe(403)
  // A second sign-up for the same address gets the same generic answer.
  await sql`DELETE FROM auth_email_limit`
  await sql`DELETE FROM auth_rate_limit`
  const duplicate = await fixture.request('/sign-up/email', {
    email: 'joiner@example.com',
    password: password + ' again',
    name: 'Someone else'
  })
  expect(duplicate.status).toBe(200)
  expect((await duplicate.json()).token).toBeNull()
  expect(fixture.links.length).toBe(1)
  // Confirming signs in and lands back on this site.
  const verify = new URL(fixture.links[0]!.url)
  expect(verify.origin).toBe(origin)
  const confirmed = await fixture.auth.handler(
    new Request(verify, {
      headers: { 'CF-Connecting-IP': fixture.ip },
      redirect: 'manual'
    })
  )
  expect(confirmed.status).toBe(302)
  expect(confirmed.headers.get('location')).toBe('/')
  const cookie = mergeCookies(confirmed)
  const me = await fixture.call('users.me', cookie)
  expect(me.status).toBe(200)
  const [row] =
    await sql`SELECT name, username FROM "user" WHERE id = ${me.data.id}`
  expect(row).toEqual({ name: 'Joiner', username: 'joiner@example.com' })
  const signedIn = await fixture.request('/sign-in/email', {
    email: 'joiner@example.com',
    password
  })
  expect(signedIn.status).toBe(200)
})

test('an unconfirmed password sign-up cannot capture an address its owner later proves by code', async () => {
  const fixture = await authFixture()
  const attacker = 'attacker controlled password'
  expect(
    (
      await fixture.request('/sign-up/email', {
        email: 'victim@example.com',
        password: attacker,
        name: 'Victim'
      })
    ).status
  ).toBe(200)
  await sql`DELETE FROM auth_email_limit`
  await signInWithCode(fixture, 'victim@example.com')
  expect(
    (
      await fixture.request('/sign-in/email', {
        email: 'victim@example.com',
        password: attacker
      })
    ).status
  ).toBe(401)
})

test('reset links are single-use, set a password and reject off-site redirects', async () => {
  const fixture = await authFixture()
  const password = 'correct horse battery staple'
  const { user } = await signInWithCode(fixture, 'resetter@example.com')
  expect(
    (
      await fixture.request('/sign-in/email', {
        email: 'resetter@example.com',
        password
      })
    ).status
  ).toBe(401)
  // The sign-in code used this address's one-a-minute allowance: the answer
  // stays generic, but no reset email is sent.
  expect(
    (
      await fixture.request('/request-password-reset', {
        email: 'resetter@example.com',
        redirectTo: '/auth/reset-password'
      })
    ).status
  ).toBe(200)
  expect(fixture.links.length).toBe(0)
  await sql`DELETE FROM auth_email_limit`
  await sql`DELETE FROM auth_verification WHERE identifier LIKE 'reset-password:%'`
  expect(
    (
      await fixture.request('/request-password-reset', {
        email: 'resetter@example.com',
        redirectTo: 'https://attacker.example/reset'
      })
    ).status
  ).toBe(403)
  // Two attempts used most of this IP's reset allowance (3 a minute).
  await sql`DELETE FROM auth_rate_limit`
  for (const email of ['nobody@example.com', 'RESETTER@example.com '])
    expect(
      (
        await fixture.request('/request-password-reset', {
          email,
          redirectTo: '/auth/reset-password'
        })
      ).status
    ).toBe(200)
  expect(fixture.links.map(({ email, kind }) => [email, kind])).toEqual([
    ['resetter@example.com', 'reset-password']
  ])
  const token = new URL(fixture.links[0]!.url).pathname.split('/').at(-1)!
  const [record] =
    await sql`SELECT identifier FROM auth_verification WHERE identifier LIKE 'reset-password:%'`
  expect(record.identifier).toBe('reset-password:' + token)
  expect(
    (await fixture.request('/reset-password', { newPassword: 'short', token }))
      .status
  ).toBe(400)
  expect(
    (await fixture.request('/reset-password', { newPassword: password, token }))
      .status
  ).toBe(200)
  expect(
    (
      await fixture.request('/reset-password', {
        newPassword: password + '!',
        token
      })
    ).status
  ).toBe(400)
  const signedIn = await fixture.request('/sign-in/email', {
    email: 'resetter@example.com',
    password
  })
  expect(signedIn.status).toBe(200)
  expect((await signedIn.json()).user.id).toBe(user.id)
})

test('magic links refuse off-site callbacks, verify once and return to this site', async () => {
  const fixture = await authFixture()
  for (const callbackURL of [
    'https://attacker.example/',
    '//attacker.example/',
    '/.//attacker.example/',
    '/\t/attacker.example/',
    '/\\attacker.example/'
  ]) {
    await sql`DELETE FROM auth_rate_limit`
    const response = await fixture.request('/sign-in/magic-link', {
      email: 'linker@example.com',
      callbackURL
    })
    expect(response.status, JSON.stringify(callbackURL)).toBe(403)
  }
  expect(fixture.links.length).toBe(0)
  await sql`DELETE FROM auth_rate_limit`
  expect(
    (
      await fixture.request('/sign-in/magic-link', {
        email: 'linker@example.com',
        callbackURL: origin + '/beers'
      })
    ).status
  ).toBe(200)
  const magic = new URL(fixture.links[0]!.url)
  expect(magic.origin).toBe(origin)
  expect(fixture.links[0]!.kind).toBe('magic-link')
  const verify = () =>
    fixture.auth.handler(
      new Request(magic, {
        headers: { 'CF-Connecting-IP': fixture.ip },
        redirect: 'manual'
      })
    )
  // A tampered link cannot redirect off-site, and refusing it spends nothing.
  for (const target of ['https://attacker.example/', '/.//attacker.example/']) {
    const tampered = new URL(magic)
    tampered.searchParams.set('callbackURL', target)
    const refused = await fixture.auth.handler(
      new Request(tampered, {
        headers: { 'CF-Connecting-IP': fixture.ip },
        redirect: 'manual'
      })
    )
    expect(refused.status).toBe(403)
  }
  const verified = await verify()
  expect(verified.status).toBe(302)
  expect(verified.headers.get('location')).toBe(origin + '/beers')
  const cookie = mergeCookies(verified)
  expect((await fixture.call('users.me', cookie)).status).toBe(200)
  const replay = await verify()
  expect(mergeCookies(replay)).not.toContain('session_token')
})

test('profile updates change names only and sync the name other members see', async () => {
  const fixture = await authFixture()
  const { cookie } = await signInWithCode(fixture, 'renamer@example.com')
  const me = await fixture.call('users.me', cookie)
  const update = (body: unknown, extra: Record<string, string> = {}) =>
    fixture.request('/update-user', body, cookie, extra)
  expect(
    (await update({ image: 'https://attacker.example/x.png' })).status
  ).toBe(400)
  expect((await update({ emailVerified: false })).status).toBe(400)
  expect(
    (await update({ name: 'Cross' }, { Origin: 'https://evil.example' })).status
  ).toBe(403)
  expect(
    (await update({ name: 'Renamed', givenName: 'Ren', familyName: null }))
      .status
  ).toBe(200)
  const [row] = await sql`SELECT name FROM "user" WHERE id = ${me.data.id}`
  expect(row.name).toBe('Renamed')
  const [account] =
    await sql`SELECT given_name, family_name, image FROM auth_user WHERE email = 'renamer@example.com'`
  expect(account).toEqual({ given_name: 'Ren', family_name: '', image: null })
})

test('profile photos are bounded, re-encoded without EXIF, private to their owner and removable', async () => {
  const fixture = await authFixture()
  const owner = await signInWithCode(fixture, 'photo@example.com')
  const other = await signInWithCode(fixture, 'other@example.com')
  const handler = createProfileHandler(fixture.db, {
    origin,
    allowedEmails: [],
    getSession: (headers) => fixture.auth.api.getSession({ headers })
  })
  const image = await sharp({
    create: { width: 64, height: 32, channels: 3, background: '#8844ff' }
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { Artist: 'Metadata to strip' } } })
    .toBuffer()
  expect((await sharp(image).metadata()).exif).toBeDefined()
  const avatar = (
    method = 'GET',
    body?: BodyInit,
    type = 'image/jpeg',
    cookie = owner.cookie,
    extra: Record<string, string> = {}
  ) =>
    handler(
      new Request(origin + '/api/profile/avatar', {
        method,
        body,
        headers: {
          Origin: origin,
          Cookie: cookie,
          'Content-Type': type,
          ...extra
        }
      })
    )
  const bytes = new Uint8Array(image)
  expect((await avatar('GET', undefined, 'image/jpeg', '')).status).toBe(401)
  expect((await avatar('PUT', bytes, 'image/jpeg', '')).status).toBe(401)
  expect((await avatar('DELETE', undefined, 'image/jpeg', '')).status).toBe(401)
  expect(
    (
      await avatar('PUT', bytes, 'image/jpeg', owner.cookie, {
        Origin: 'https://evil.example'
      })
    ).status
  ).toBe(403)
  expect(
    (
      await avatar('PUT', bytes, 'image/jpeg', owner.cookie, {
        'Sec-Fetch-Site': 'cross-site'
      })
    ).status
  ).toBe(403)
  expect((await avatar('PATCH', bytes)).status).toBe(405)
  // Non-images are refused by type and, when mislabelled, by signature.
  expect(
    (await avatar('PUT', '<svg onload="alert(1)"/>', 'image/svg+xml')).status
  ).toBe(415)
  expect(
    (await avatar('PUT', '<svg onload="alert(1)"/>', 'image/png')).status
  ).toBe(400)
  expect((await avatar('PUT', 'GIF89a not allowed', 'image/jpeg')).status).toBe(
    400
  )
  // A valid signature on a truncated image is still unreadable.
  expect(
    (await avatar('PUT', new Uint8Array(image.subarray(0, 40)))).status
  ).toBe(400)
  const oversized = new Uint8Array(2 * 1024 * 1024 + 1)
  oversized.set([0xff, 0xd8, 0xff])
  expect((await avatar('PUT', oversized)).status).toBe(413)
  expect((await sql`SELECT count(*)::int AS n FROM user_profile`)[0].n).toBe(0)

  const first = await avatar('PUT', bytes)
  expect(first.status).toBe(200)
  expect(first.headers.get('Cache-Control')).toBe('no-store')
  const { image: initial } = (await first.json()) as { image: string }
  expect(initial).toMatch(/^\/api\/profile\/avatar\?v=[0-9a-f-]{36}$/)
  const picture = await avatar()
  expect(picture.status).toBe(200)
  expect(picture.headers.get('Content-Type')).toBe('image/jpeg')
  expect(picture.headers.get('Cache-Control')).toBe('no-store')
  expect(picture.headers.get('X-Content-Type-Options')).toBe('nosniff')
  expect(picture.headers.get('Cross-Origin-Resource-Policy')).toBe(
    'same-origin'
  )
  const stored = Buffer.from(await picture.arrayBuffer())
  const metadata = await sharp(stored).metadata()
  expect(metadata.format).toBe('jpeg')
  expect([metadata.width, metadata.height]).toEqual([256, 256])
  expect(metadata.exif).toBeUndefined()
  expect(stored.includes(Buffer.from('Metadata to strip'))).toBe(false)
  // The session's image is the server-owned URL; update-user may only confirm it.
  const [account] =
    await sql`SELECT image FROM auth_user WHERE id = ${owner.user.id}`
  expect(account.image).toBe(initial)
  expect(
    (await fixture.request('/update-user', { image: initial }, owner.cookie))
      .status
  ).toBe(200)
  expect(
    (await fixture.request('/update-user', { image: null }, owner.cookie))
      .status
  ).toBe(400)
  expect(
    (await fixture.request('/update-user', { image: initial }, other.cookie))
      .status
  ).toBe(400)
  // Another member gets only their own (absent) photo, whatever the URL says.
  const otherRead = await handler(
    new Request(origin + initial, { headers: { Cookie: other.cookie } })
  )
  expect(otherRead.status).toBe(404)
  expect(otherRead.headers.get('Content-Type')).not.toBe('image/jpeg')

  // Replacing changes the stored image and its version.
  const png = await sharp({
    create: { width: 300, height: 600, channels: 4, background: '#00ff0080' }
  })
    .png()
    .toBuffer()
  const second = await avatar('PUT', new Uint8Array(png), 'image/png')
  expect(second.status).toBe(200)
  const { image: replaced } = (await second.json()) as { image: string }
  expect(replaced).not.toBe(initial)
  const [updated] =
    await sql`SELECT image FROM auth_user WHERE id = ${owner.user.id}`
  expect(updated.image).toBe(replaced)
  const replacedBytes = Buffer.from(await (await avatar()).arrayBuffer())
  expect(replacedBytes.equals(stored)).toBe(false)
  expect((await sharp(replacedBytes).metadata()).format).toBe('jpeg')
  expect(
    (await fixture.request('/update-user', { image: initial }, owner.cookie))
      .status
  ).toBe(400)

  // Removing clears both the photo and the account image.
  const removed = await avatar('DELETE')
  expect(removed.status).toBe(200)
  expect(await removed.json()).toEqual({ image: null })
  expect((await avatar()).status).toBe(404)
  const [cleared] =
    await sql`SELECT image FROM auth_user WHERE id = ${owner.user.id}`
  expect(cleared.image).toBeNull()
  expect(
    (await fixture.request('/update-user', { image: null }, owner.cookie))
      .status
  ).toBe(200)
  // Deleting the account deletes its photo row.
  await avatar('PUT', bytes)
  await sql`DELETE FROM auth_user WHERE id = ${owner.user.id}`
  expect((await sql`SELECT count(*)::int AS n FROM user_profile`)[0].n).toBe(0)
})

test('profile photos need a verified email that is still on a configured allowlist', async () => {
  const fixture = await authFixture({ allowedEmails: ['listed@example.com'] })
  const { cookie } = await signInWithCode(fixture, 'listed@example.com')
  const image = new Uint8Array(
    await sharp({
      create: { width: 8, height: 8, channels: 3, background: '#000' }
    })
      .jpeg()
      .toBuffer()
  )
  const put = (allowedEmails: string[]) =>
    createProfileHandler(fixture.db, {
      origin,
      allowedEmails,
      getSession: (headers) => fixture.auth.api.getSession({ headers })
    })(
      new Request(origin + '/api/profile/avatar', {
        method: 'PUT',
        body: image,
        headers: {
          Origin: origin,
          Cookie: cookie,
          'Content-Type': 'image/jpeg'
        }
      })
    )
  expect((await put(['listed@example.com'])).status).toBe(200)
  // Removing the address from the list revokes the same session.
  expect((await put(['someone-else@example.com'])).status).toBe(403)
  // An unverified account is refused even with open sign-up.
  const unverified = createProfileHandler(fixture.db, {
    origin,
    allowedEmails: [],
    getSession: async () => ({
      user: { id: 'unverified', email: 'new@example.com', emailVerified: false }
    })
  })
  expect(
    (await unverified(new Request(origin + '/api/profile/avatar'))).status
  ).toBe(403)
})

test('the photo route is forwarded by the server and is a 404 under Clerk', async () => {
  const app = createApp({
    app: () => new Response('app'),
    checkHealth: async () => {},
    origin,
    revision: 'test'
  })
  expect(
    await (await app(new Request(origin + '/api/profile/avatar'))).text()
  ).toBe('app')
  expect((await app(new Request(origin + '/api/profile/other'))).status).toBe(
    404
  )
  // Only the photo route accepts bodies above the 64 KB server-wide limit.
  const body = (path: string, size: number) =>
    app(
      new Request(origin + path, {
        method: 'POST',
        headers: { Origin: origin, 'Content-Length': String(size) },
        body: new Uint8Array(size)
      })
    )
  expect(
    (await body('/api/trpc/beers.save', requestBodyLimit + 1)).status
  ).toBe(413)
  expect(
    (await body('/api/auth/sign-in/email', requestBodyLimit + 1)).status
  ).toBe(413)
  expect(await (await body('/api/trpc/beers.save', 1024)).text()).toBe('app')
  expect(await (await body('/api/profile/avatar', 1024 * 1024)).text()).toBe(
    'app'
  )
  expect(serverBodyLimit).toBeGreaterThan(2 * 1024 * 1024)
  const { handleProfileRequest } = await import('../src/server/profile')
  const saved = { ...process.env }
  try {
    Object.assign(process.env, {
      DATABASE_URL: 'postgres://u@localhost/db',
      APP_ORIGIN: origin,
      CLERK_PUBLISHABLE_KEY: 'pk_test_ZXhhbXBsZS5jb20k',
      CLERK_SECRET_KEY: 'sk_test_fixture'
    })
    delete process.env.AUTH_PROVIDER
    for (const method of ['GET', 'PUT', 'DELETE'])
      expect(
        (
          await handleProfileRequest(
            new Request(origin + '/api/profile/avatar', {
              method,
              headers: { Origin: origin }
            })
          )
        ).status
      ).toBe(404)
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key]
    Object.assign(process.env, saved)
  }
})

test('the app exposes only the allowlisted auth endpoints, including open sign-up', async () => {
  const fixture = await authFixture()
  const handler = createAuthRouteHandler(
    () => 'better-auth',
    () => fixture.auth
  )
  const post = (path: string, method = 'POST') =>
    handler(
      new Request(origin + '/api/auth' + path, {
        method,
        headers: {
          Origin: origin,
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '198.51.100.' + ++fixtureNumber
        },
        body: method === 'POST' ? '{}' : undefined
      })
    )
  for (const path of [
    '/sign-up/email',
    '/sign-in/email',
    '/sign-in/magic-link',
    '/request-password-reset',
    '/reset-password',
    '/send-verification-email'
  ])
    expect((await post(path)).status, path).not.toBe(404)
  for (const path of ['/get-session', '/list-accounts', '/verify-email'])
    expect((await post(path, 'GET')).status, path).not.toBe(404)
  for (const path of [
    '/email-otp/get-verification-otp',
    '/email-otp/send-verification-otp/../../delete-user',
    '/delete-user',
    '/change-email',
    '/list-sessions'
  ])
    expect((await post(path)).status, path).toBe(404)
  // Clerk mode exposes none of them.
  const clerk = createAuthRouteHandler(
    () => 'clerk',
    () => {
      throw new Error('Better Auth must not load under Clerk')
    }
  )
  for (const path of ['/get-session', '/sign-up/email', '/sign-in/email-otp'])
    expect((await clerk(new Request(origin + '/api/auth' + path))).status).toBe(
      404
    )
  // The Bun server forwards /api/auth/* to the app instead of 404ing it.
  const app = createApp({
    app: () => new Response('app'),
    checkHealth: async () => {},
    origin,
    revision: 'test'
  })
  expect(
    await (await app(new Request(origin + '/api/auth/get-session'))).text()
  ).toBe('app')
  expect((await app(new Request(origin + '/api/other'))).status).toBe(404)
})

test('Clerk mode is unchanged: members resolve by Clerk id', async () => {
  await resetAuth()
  const db = orm(sql)
  const trpc = createTrpcHandler(
    db,
    async (request) => request.headers.get('x-test-clerk-user'),
    async () => []
  )
  const me = await trpc(
    new Request(origin + '/api/trpc/users.me', {
      headers: { 'x-test-clerk-user': kyleClerk }
    })
  )
  expect(me.status).toBe(200)
  expect((await me.json()).result.data.json.id).toBe(kyleId)
  expect((await trpc(new Request(origin + '/api/trpc/users.me'))).status).toBe(
    401
  )
  const { requestOptions } = await import('../src/server/request-options')
  const saved = { ...process.env }
  try {
    Object.assign(process.env, {
      DATABASE_URL: 'postgres://u@localhost/db',
      APP_ORIGIN: origin,
      CLERK_PUBLISHABLE_KEY: 'pk_test_ZXhhbXBsZS5jb20k',
      CLERK_SECRET_KEY: 'sk_test_fixture'
    })
    delete process.env.AUTH_PROVIDER
    expect(requestOptions().requestMiddleware).toHaveLength(1)
    Object.assign(process.env, {
      AUTH_PROVIDER: 'better-auth',
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: secret,
      BREVO_API_KEY: 'fixture',
      AUTH_EMAIL_FROM: 'hello@example.com'
    })
    expect(requestOptions()).toEqual({})
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key]
    Object.assign(process.env, saved)
  }
})

test('the cutover script links Clerk members by verified primary email, idempotently', async () => {
  await resetAuth()
  const db = drizzle(sql, { schema })
  const clerkUsers = [
    { id: kyleClerk, email: 'kyle@example.com' },
    // Partner has no verified primary email in Clerk.
    { id: 'user_partner_fixture', email: null },
    // A Clerk user who never got an app row.
    { id: 'user_without_row', email: 'norow@example.com' }
  ]
  // The stranger fixture's Clerk user no longer exists: an orphan app row.
  const dryRun = await linkClerkUsers(db, clerkUsers, { apply: false })
  expect(dryRun).toEqual({
    clerkUsers: 3,
    withoutVerifiedEmail: 1,
    withoutAppUser: 1,
    alreadyLinked: 0,
    linked: 1,
    authUsersCreated: 1,
    conflicts: 0,
    orphanAppUsers: 1
  })
  expect((await sql`SELECT id FROM auth_user`).length).toBe(0)
  expect(
    (
      await sql`SELECT count(*)::int AS n FROM "user" WHERE auth_user_id IS NOT NULL`
    )[0].n
  ).toBe(0)
  const applied = await linkClerkUsers(db, clerkUsers, { apply: true })
  expect(applied).toEqual(dryRun)
  const again = await linkClerkUsers(db, clerkUsers, { apply: true })
  expect(again).toMatchObject({
    alreadyLinked: 1,
    linked: 0,
    authUsersCreated: 0
  })
  const [linked] = await sql`
    SELECT a.email, a.email_verified, a.name FROM "user" u
    JOIN auth_user a ON a.id = u.auth_user_id WHERE u.id = ${kyleId}`
  expect(linked).toEqual({
    email: 'kyle@example.com',
    email_verified: true,
    name: 'Test Kyle'
  })
  const users = await sql`SELECT count(*)::int AS n FROM "user"`
  expect(users[0].n).toBe(3)
  // The member signs in by code and lands in their existing pot.
  const fixture = await createFixtureKeepingUsers()
  const { cookie } = await signInWithCode(fixture, 'kyle@example.com')
  const me = await fixture.call('users.me', cookie)
  expect(me.data).toEqual({
    id: kyleId,
    groupId: '11111111-1111-4111-8111-111111111111'
  })
  const beers = await fixture.call('beer.list', cookie)
  expect(beers.data.map((beer: { name: string }) => beer.name).sort()).toEqual([
    'Faith',
    'Old Stout'
  ])
  // An unverified Better Auth account for a member's address is never linked.
  await sql`UPDATE "user" SET auth_user_id = NULL WHERE id = ${kyleId}`
  await sql`UPDATE auth_user SET email_verified = false WHERE email = 'kyle@example.com'`
  expect(await linkClerkUsers(db, clerkUsers, { apply: true })).toMatchObject({
    conflicts: 1,
    linked: 0
  })
})

async function createFixtureKeepingUsers() {
  const db = orm(sql)
  const codes = new Map<string, string>()
  const auth = createDatePotAuth(
    db,
    { baseURL: origin, secret, allowedEmails: [], dailyEmailLimit: 40 },
    async (email, otp) => {
      codes.set(email, otp)
    }
  )
  const ip = `203.0.113.${++fixtureNumber}`
  const trpc = createTrpcHandler(
    db,
    betterAuthIdentity(db, auth, []),
    async () => [],
    'better-auth'
  )
  return {
    auth,
    db,
    codes,
    links: [],
    ip,
    request: (path: string, body?: unknown, cookie = '') =>
      auth.handler(
        new Request(origin + '/api/auth' + path, {
          method: body === undefined ? 'GET' : 'POST',
          headers: {
            Origin: origin,
            'Content-Type': 'application/json',
            'CF-Connecting-IP': ip,
            Cookie: cookie
          },
          body: body === undefined ? undefined : JSON.stringify(body)
        })
      ),
    call: async (procedure: string, cookie: string) => {
      const response = await trpc(
        new Request(origin + '/api/trpc/' + procedure, {
          headers: { Cookie: cookie }
        })
      )
      const body = await response.json()
      return { status: response.status, data: body.result?.data?.json }
    }
  } as unknown as Awaited<ReturnType<typeof authFixture>>
}

test('an --email override links a member under a corrected address', async () => {
  await resetAuth()
  const db = drizzle(sql, { schema })
  const overrides = parseEmailOverrides([
    '--apply',
    '--email',
    kyleClerk + '= Kyle.New@Example.com '
  ])
  expect([...overrides]).toEqual([[kyleClerk, 'kyle.new@example.com']])
  for (const bad of [
    ['--email'],
    ['--email', 'kyle@example.com'],
    ['--email', 'user_x=not-an-email'],
    ['--email', 'notclerk=kyle@example.com'],
    ['--email', 'user_x=a@example.com', '--email', 'user_x=b@example.com']
  ])
    expect(() => parseEmailOverrides(bad)).toThrow()
  // The Clerk email is a typo the member never used.
  const clerkUsers = applyEmailOverrides(
    [{ id: kyleClerk, email: 'kyel@example.com' }],
    overrides
  )
  expect(() =>
    applyEmailOverrides(
      clerkUsers,
      new Map([['user_missing', 'a@example.com']])
    )
  ).toThrow()
  expect(await linkClerkUsers(db, clerkUsers, { apply: true })).toMatchObject({
    linked: 1,
    authUsersCreated: 1
  })
  const [linked] = await sql`
    SELECT a.email, a.email_verified FROM "user" u
    JOIN auth_user a ON a.id = u.auth_user_id WHERE u.id = ${kyleId}`
  expect(linked).toEqual({
    email: 'kyle.new@example.com',
    email_verified: true
  })
  expect(
    (
      await sql`SELECT count(*)::int AS n FROM auth_user WHERE email = 'kyel@example.com'`
    )[0].n
  ).toBe(0)
})

test('Clerk listing pages through users and keeps only verified primary emails', async () => {
  const page = (count: number, start: number) =>
    Array.from({ length: count }, (_, index) => ({
      id: 'user_' + (start + index),
      primary_email_address_id: 'e' + (start + index),
      email_addresses: [
        {
          id: 'e' + (start + index),
          email_address: `Person${start + index}@Example.com`,
          verification: { status: index === 0 ? 'unverified' : 'verified' }
        }
      ]
    }))
  const requests: string[] = []
  const users = await listClerkUsers('sk_test_fixture', (async (
    url: URL,
    init: RequestInit
  ) => {
    requests.push(new URL(url).searchParams.get('offset')!)
    expect(new Headers(init.headers).get('authorization')).toBe(
      'Bearer sk_test_fixture'
    )
    const offset = Number(new URL(url).searchParams.get('offset'))
    return Response.json(offset === 0 ? page(100, 0) : page(5, 100))
  }) as unknown as typeof fetch)
  expect(requests).toEqual(['0', '100'])
  expect(users).toHaveLength(105)
  expect(users[0]).toEqual({ id: 'user_0', email: null })
  expect(users[1]).toEqual({ id: 'user_1', email: 'person1@example.com' })
  expect(
    verifiedPrimaryEmail({
      id: 'user_x',
      primary_email_address_id: 'primary',
      email_addresses: [
        {
          id: 'other',
          email_address: 'other@example.com',
          verification: { status: 'verified' }
        },
        { id: 'primary', email_address: 'p@example.com', verification: null }
      ]
    })
  ).toBeNull()
  await expect(
    listClerkUsers(
      'sk',
      (async () =>
        new Response('secret detail', {
          status: 401
        })) as unknown as typeof fetch
    )
  ).rejects.toThrow('Clerk API request failed with status 401')
})

test('resolveAppUser reuses a linked row instead of creating another', async () => {
  await resetAuth()
  const db = orm(sql)
  await sql`INSERT INTO auth_user (id, name, email, email_verified) VALUES ('ba_kyle', 'Kyle', 'k@example.com', true)`
  await sql`UPDATE "user" SET auth_user_id = 'ba_kyle' WHERE id = ${kyleId}`
  expect(
    await resolveAppUser(db, {
      id: 'ba_kyle',
      email: 'k@example.com',
      name: 'Kyle'
    })
  ).toBe(kyleId)
  expect((await sql`SELECT count(*)::int AS n FROM "user"`)[0].n).toBe(3)
})
