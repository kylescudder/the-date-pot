import { afterAll, beforeAll, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { database, migrate, orm, type Database } from '../src/server/db'
import { appRouter } from '../src/server/router'
import { createApp } from './app'
import { createHealthCheck } from '../src/server/health'

if (!process.env.TEST_DATABASE_URL)
  throw new Error(
    'TEST_DATABASE_URL must identify a disposable test PostgreSQL service'
  )
const admin = postgres(process.env.TEST_DATABASE_URL, {
  max: 1,
  onnotice: () => {}
})
const name = 'datepot_ci_' + randomUUID().replaceAll('-', '').slice(0, 10)
const pushedName = name + '_pushed'
const clients: Database[] = []
let sql: Database

function databaseUrl(db: string) {
  const url = new URL(process.env.TEST_DATABASE_URL!)
  url.pathname = '/' + db
  return url.toString()
}
function client(db: string) {
  const connection = database(databaseUrl(db))
  clients.push(connection)
  return connection
}

const kyle = 'user_kyle_fixture'
const partnerId = '22222222-2222-4222-8222-222222222222'
const strangerBeer = '99999999-9999-4999-8999-999999999991'
const faith = '55555555-5555-4555-8555-555555555551'
const northernMonk = '44444444-4444-4444-8444-444444444441'
const cloudwater = '44444444-4444-4444-8444-444444444442'
const ipa = '44444444-4444-4444-8444-444444444451'

const caller = (userId: string | null) =>
  appRouter.createCaller({
    db: orm(sql),
    userId,
    geocode: async (address) => (address === 'Manchester' ? [-2.24, 53.48] : [])
  })

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE "${name}"`)
  await admin.unsafe(`CREATE DATABASE "${pushedName}"`)
  sql = client(name)
  await migrate(sql)
  // Running again must be a no-op.
  await migrate(sql)
  const seed = readFileSync(
    new URL('../tests/fixtures/seed.sql', import.meta.url),
    'utf8'
  ).replaceAll('user_3LFVN7yEgn8eAU4XqJzSXvo2oqd', kyle)
  await sql.unsafe(seed)
})

afterAll(async () => {
  await Promise.all(clients.map((connection) => connection.end({ timeout: 1 })))
  for (const db of [name, pushedName])
    await admin.unsafe(`DROP DATABASE IF EXISTS "${db}" WITH (FORCE)`)
  await admin.end()
})

test('the baseline leaves a database created by drizzle-kit push untouched', async () => {
  const pushed = client(pushedName)
  // Production predates migrations; stand in for it with a differently shaped table.
  await pushed.unsafe(
    'CREATE TABLE "user" (id uuid PRIMARY KEY, "clerkId" varchar NOT NULL, onboarded boolean)'
  )
  await migrate(pushed)
  const tables = await pushed`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  expect(tables.map((row) => row.tablename)).toEqual(['user'])
  const journal =
    await pushed`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`
  expect(journal[0].n).toBe(1)
})

test('signed-out requests are rejected', async () => {
  await expect(caller(null).beer.list()).rejects.toMatchObject({
    code: 'UNAUTHORIZED'
  })
})

test('a signed-in Clerk user without a group is told so', async () => {
  await expect(caller('user_nobody').users.me()).rejects.toMatchObject({
    code: 'FORBIDDEN'
  })
})

test('lists show only the member’s own group, with averaged ratings', async () => {
  const beers = await caller(kyle).beer.list()
  expect(beers.map((beer) => beer.name).sort()).toEqual(['Faith', 'Old Stout'])
  const rated = beers.find((beer) => beer.id === faith)!
  expect(rated).toMatchObject({ avgWankyness: 3, avgTaste: 4, avgRating: 3.5 })
  const users = await caller(kyle).users.group()
  expect(users.map((user) => user.name).sort()).toEqual([
    'Test Kyle',
    'Test Partner'
  ])
})

test('another group’s records cannot be read, changed or archived', async () => {
  const me = caller(kyle)
  await expect(me.beer.get(strangerBeer)).rejects.toMatchObject({
    code: 'NOT_FOUND'
  })
  await expect(me.beer.ratings(strangerBeer)).rejects.toMatchObject({
    code: 'NOT_FOUND'
  })
  await expect(
    me.beer.save({
      id: strangerBeer,
      name: 'Hijacked',
      abv: 1,
      archive: false,
      breweries: [],
      beerTypes: []
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  await expect(me.beer.archive(strangerBeer)).rejects.toMatchObject({
    code: 'NOT_FOUND'
  })
  const [row] =
    await sql`SELECT name, archive, "userGroupId" FROM beer WHERE id = ${strangerBeer}`
  expect(row).toEqual({
    name: "Someone Else's Beer",
    archive: false,
    userGroupId: '99999999-9999-4999-8999-999999999999'
  })
})

test('saving a beer replaces its breweries and types with the selection', async () => {
  const me = caller(kyle)
  await me.beer.save({
    id: faith,
    name: 'Faith',
    abv: 5.4,
    archive: false,
    breweries: [cloudwater],
    beerTypes: []
  })
  expect(await me.beer.get(faith)).toMatchObject({
    breweries: [cloudwater],
    beerTypes: []
  })
  await me.beer.save({
    id: faith,
    name: 'Faith',
    abv: 5.4,
    archive: false,
    breweries: [northernMonk, cloudwater],
    beerTypes: [ipa]
  })
  const beer = await me.beer.get(faith)
  expect(beer.breweries.sort()).toEqual([northernMonk, cloudwater].sort())
  expect(beer.beerTypes).toEqual([ipa])
})

test('a new beer belongs to the member’s group and records who added it', async () => {
  const me = caller(kyle)
  const beer = await me.beer.save({
    id: '',
    name: 'Fresh Pale',
    abv: 4.2,
    archive: false,
    breweries: [northernMonk],
    beerTypes: []
  })
  expect(beer).toMatchObject({
    userGroupId: '11111111-1111-4111-8111-111111111111',
    addedById: '22222222-2222-4222-8222-222222222221'
  })
  await me.beer.archive(beer.id)
  expect((await me.beer.list()).some((row) => row.id === beer.id)).toBe(false)
})

test('ratings must come from group members and use half-star steps', async () => {
  const me = caller(kyle)
  const rating = await me.beer.saveRating({
    id: '',
    beerId: faith,
    userId: partnerId,
    wankyness: 1,
    taste: 2
  })
  expect(rating).toMatchObject({ beerId: faith, userId: partnerId })
  await expect(
    me.beer.saveRating({
      id: '',
      beerId: faith,
      userId: '99999999-9999-4999-8999-999999999998',
      wankyness: 1,
      taste: 1
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  await expect(
    me.beer.saveRating({
      id: '',
      beerId: faith,
      userId: partnerId,
      wankyness: 1.25,
      taste: 1
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  await me.beer.deleteRating(rating.id)
  expect(
    (await me.beer.ratings(faith)).some((row) => row.id === rating.id)
  ).toBe(false)
})

test('films keep their dates and list the names it searches on', async () => {
  const me = caller(kyle)
  const film = await me.film.save({
    id: '',
    name: 'Past Lives',
    archive: false,
    addedDate: new Date('2026-10-01T00:00:00Z'),
    releaseDate: new Date('2023-06-02T00:00:00Z'),
    runTime: 106,
    watched: false,
    directors: ['44444444-4444-4444-8444-444444444481'],
    genres: [
      '44444444-4444-4444-8444-444444444491',
      '44444444-4444-4444-8444-444444444492'
    ],
    platforms: []
  })
  const saved = await me.film.get(film.id)
  expect(saved.releaseDate).toBeInstanceOf(Date)
  expect(saved.releaseDate.toISOString()).toBe('2023-06-02T00:00:00.000Z')
  const listed = (await me.film.list()).find((row) => row.id === film.id)!
  expect(listed.directors).toEqual(['Greta Gerwig'])
  expect(listed.genres.sort()).toEqual(['Comedy', 'Drama'])
})

test('places are scoped to the group and geocoding stays server-side', async () => {
  const me = caller(kyle)
  const restaurant = await me.restaurant.save({
    id: '',
    name: 'Cafe',
    address: 'Manchester',
    archive: false,
    cuisines: ['44444444-4444-4444-8444-444444444462'],
    whens: []
  })
  expect(await me.restaurant.get(restaurant.id)).toMatchObject({
    cuisines: ['44444444-4444-4444-8444-444444444462'],
    notes: []
  })
  expect(await me.maps.lookup('Manchester')).toEqual([-2.24, 53.48])
  expect(await me.maps.lookup('')).toEqual([])
  await expect(
    caller('user_stranger_fixture').restaurant.get(restaurant.id)
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  const vinyl = await me.vinyl.save({
    id: '',
    name: 'Hejira',
    artist: 'Joni Mitchell',
    archive: false,
    purchased: true
  })
  expect(vinyl.purchased).toBe(true)
})

test('/healthz reports the revision, or 503 when the database is down', async () => {
  const app = (checkHealth: () => Promise<void>) =>
    createApp({
      app: () => new Response('app'),
      checkHealth,
      origin: 'http://localhost:3000',
      revision: 'abc123'
    })
  const ok = await app(createHealthCheck(databaseUrl(name)))(
    new Request('http://localhost:3000/healthz')
  )
  expect(ok.status).toBe(200)
  expect(await ok.json()).toEqual({ ok: true, revision: 'abc123' })
  expect(ok.headers.get('X-Date-Pot-Revision')).toBe('abc123')
  expect(ok.headers.get('Cache-Control')).toBe('no-store')
  const down = await app(createHealthCheck(databaseUrl(name + '_missing')))(
    new Request('http://localhost:3000/healthz')
  )
  expect(down.status).toBe(503)
  const crossSite = await app(async () => {})(
    new Request('http://localhost:3000/api/trpc/beer.list', {
      headers: { origin: 'https://evil.example' }
    })
  )
  expect(crossSite.status).toBe(403)
})
