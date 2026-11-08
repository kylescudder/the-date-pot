// Links existing members to Better Auth accounts before AUTH_PROVIDER is
// switched. For every Clerk user with a verified primary email, it finds or
// creates the Better Auth user for that address (marked verified, because Clerk
// verified it) and records it in `user.auth_user_id` on the member's existing
// row, so their groups, pots and ratings carry over unchanged.
//
// Dry run by default; `--apply` writes. Idempotent. Prints counts only, never
// emails, names, IDs or tokens. Never deletes or rewrites app rows.
//
// `--email <clerk user id>=<address>` (repeatable) links that Clerk user's
// member under a different address, for example when the Clerk email is wrong
// or no longer used. The operator vouches for the address, so it is treated as
// verified; the member then signs in with it.
//
//   docker compose --env-file .env run --rm the-date-pot \
//     bun deploy/link-clerk-users.ts [--email user_x=new@example.com] [--apply]
import { randomUUID } from 'node:crypto'
import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../src/server/db/schema'
import { authUser, user } from '../src/server/db/schema'
import { createDeploymentDatabase } from './database'

export type ClerkUser = { id: string; email: string | null }

type ClerkApiUser = {
  id: string
  primary_email_address_id: string | null
  email_addresses: {
    id: string
    email_address: string
    verification: { status: string } | null
  }[]
}

// Only a verified primary email links an account; anything else is skipped.
export function verifiedPrimaryEmail(clerkUser: ClerkApiUser) {
  const primary = clerkUser.email_addresses.find(
    (address) => address.id === clerkUser.primary_email_address_id
  )
  return primary?.verification?.status === 'verified'
    ? primary.email_address.trim().toLowerCase()
    : null
}

export async function listClerkUsers(
  secretKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<ClerkUser[]> {
  const users: ClerkUser[] = []
  const limit = 100
  for (let offset = 0; ; offset += limit) {
    const url = new URL('https://api.clerk.com/v1/users')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
    url.searchParams.set('order_by', 'created_at')
    const response = await fetchImpl(url, {
      headers: { Authorization: 'Bearer ' + secretKey },
      signal: AbortSignal.timeout(15000)
    })
    // Never echo the response: it can contain personal data.
    if (!response.ok)
      throw new Error('Clerk API request failed with status ' + response.status)
    const page = (await response.json()) as ClerkApiUser[]
    for (const clerkUser of page)
      users.push({ id: clerkUser.id, email: verifiedPrimaryEmail(clerkUser) })
    if (page.length < limit) return users
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Parses `--email <clerk user id>=<address>` pairs. Throws on anything
// malformed rather than guessing, and never echoes the address.
export function parseEmailOverrides(args: readonly string[]) {
  const overrides = new Map<string, string>()
  for (let index = 0; index < args.length; index++) {
    if (args[index] !== '--email') continue
    const pair = args[++index] ?? ''
    const separator = pair.indexOf('=')
    const clerkId = pair.slice(0, separator).trim()
    const email = pair
      .slice(separator + 1)
      .trim()
      .toLowerCase()
    if (
      separator < 1 ||
      !clerkId.startsWith('user_') ||
      !emailPattern.test(email)
    )
      throw new Error('--email expects <clerk user id>=<email address>')
    if (overrides.has(clerkId))
      throw new Error('--email given twice for one Clerk user')
    overrides.set(clerkId, email)
  }
  return overrides
}

// Replaces the email of each overridden Clerk user. Every override must name a
// Clerk user that exists, so a typo cannot silently link nobody.
export function applyEmailOverrides(
  clerkUsers: readonly ClerkUser[],
  overrides: ReadonlyMap<string, string>
): ClerkUser[] {
  const ids = new Set(clerkUsers.map((clerkUser) => clerkUser.id))
  for (const clerkId of overrides.keys())
    if (!ids.has(clerkId))
      throw new Error(
        'An --email override names a Clerk user that does not exist'
      )
  return clerkUsers.map((clerkUser) => ({
    id: clerkUser.id,
    email: overrides.get(clerkUser.id) ?? clerkUser.email
  }))
}

type Orm = ReturnType<typeof drizzle<typeof schema>>

export type LinkReport = {
  clerkUsers: number
  withoutVerifiedEmail: number
  withoutAppUser: number
  alreadyLinked: number
  linked: number
  authUsersCreated: number
  conflicts: number
  orphanAppUsers: number
}

export async function linkClerkUsers(
  db: Orm,
  clerkUsers: readonly ClerkUser[],
  { apply }: { apply: boolean }
): Promise<LinkReport> {
  const report: LinkReport = {
    clerkUsers: clerkUsers.length,
    withoutVerifiedEmail: 0,
    withoutAppUser: 0,
    alreadyLinked: 0,
    linked: 0,
    authUsersCreated: 0,
    conflicts: 0,
    orphanAppUsers: 0
  }
  const clerkIds = new Set(clerkUsers.map((clerkUser) => clerkUser.id))
  // App rows with no Clerk user are reported, never deleted or changed.
  const unlinked = await db
    .select({ clerkId: user.clerkId })
    .from(user)
    .where(and(isNull(user.authUserId), isNotNull(user.clerkId)))
  report.orphanAppUsers = unlinked.filter(
    (row) => !clerkIds.has(row.clerkId!)
  ).length
  const emails = new Set<string>()
  for (const clerkUser of clerkUsers) {
    if (!clerkUser.email) {
      report.withoutVerifiedEmail++
      continue
    }
    // Two Clerk users must never share one Better Auth account.
    if (emails.has(clerkUser.email)) {
      report.conflicts++
      continue
    }
    emails.add(clerkUser.email)
    const email = clerkUser.email
    const outcome = await db.transaction(async (transaction) => {
      const [row] = await transaction
        .select({ id: user.id, name: user.name, authUserId: user.authUserId })
        .from(user)
        .where(eq(user.clerkId, clerkUser.id))
        .limit(1)
        .for('update')
      if (!row) return 'withoutAppUser' as const
      if (row.authUserId) return 'alreadyLinked' as const
      const [existing] = await transaction
        .select({ id: authUser.id, emailVerified: authUser.emailVerified })
        .from(authUser)
        .where(eq(authUser.email, email))
      if (existing) {
        // An unverified account (e.g. a password sign-up nobody confirmed)
        // must not inherit this member's data, and one already linked to
        // another row must not be shared.
        const [owner] = await transaction
          .select({ id: user.id })
          .from(user)
          .where(eq(user.authUserId, existing.id))
        if (!existing.emailVerified || owner) return 'conflicts' as const
      }
      if (!apply) return existing ? 'linked' : ('created' as const)
      let authUserId = existing?.id
      if (!authUserId) {
        authUserId = randomUUID()
        await transaction.insert(authUser).values({
          id: authUserId,
          email,
          name: row.name,
          emailVerified: true
        })
      }
      await transaction
        .update(user)
        .set({ authUserId })
        .where(and(eq(user.id, row.id), isNull(user.authUserId)))
      return existing ? 'linked' : ('created' as const)
    })
    if (outcome === 'created') {
      report.authUsersCreated++
      report.linked++
    } else report[outcome]++
  }
  return report
}

if (import.meta.main) {
  const apply = process.argv.includes('--apply')
  const overrides = parseEmailOverrides(process.argv.slice(2))
  const secretKey = process.env.CLERK_SECRET_KEY
  const databaseUrl = process.env.DATABASE_URL
  if (!secretKey || !databaseUrl)
    throw new Error('Set CLERK_SECRET_KEY and DATABASE_URL')
  const clerkUsers = applyEmailOverrides(
    await listClerkUsers(secretKey),
    overrides
  )
  const sql = createDeploymentDatabase(databaseUrl)
  try {
    const report = await linkClerkUsers(drizzle(sql, { schema }), clerkUsers, {
      apply
    })
    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'dry-run',
          emailOverrides: overrides.size,
          ...report
        },
        null,
        2
      )
    )
    if (!apply)
      console.log('Dry run: nothing was written. Re-run with --apply.')
  } finally {
    await sql.end()
  }
}
