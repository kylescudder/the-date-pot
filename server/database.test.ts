import { expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'
import { database, migrationDatabase, orm } from '../src/server/db'
import { beerType } from '../src/server/db/schema'

const url = process.env.TEST_DATABASE_URL
if (!url)
  throw new Error(
    'TEST_DATABASE_URL must identify a disposable test PostgreSQL service'
  )

test('application connections have bounded idle and connection waits', async () => {
  const sql = database(url)
  try {
    expect(sql.options.max).toBe(4)
    expect(sql.options.idle_timeout).toBe(20)
    expect(sql.options.connect_timeout).toBe(10)
    expect((await sql`SELECT 42 AS answer`)[0].answer).toBe(42)
  } finally {
    await sql.end({ timeout: 1 })
  }
})

test('owner migration queries serialize on one connection', async () => {
  const sql = migrationDatabase(url)
  try {
    expect(sql.options.max).toBe(1)
    expect(sql.options.idle_timeout).toBe(20)
    expect(sql.options.connect_timeout).toBe(10)
    const rows = await Promise.all(
      Array.from(
        { length: 4 },
        () => sql`SELECT pg_backend_pid() AS pid, pg_sleep(0.05)`
      )
    )
    expect(new Set(rows.map(([row]) => row.pid)).size).toBe(1)
  } finally {
    await sql.end({ timeout: 1 })
  }
})

test('an idle application connection retires and reconnects for the next query', async () => {
  const sql = database(url)
  const observer = postgres(url, { max: 1, onnotice: () => {} })
  try {
    const [first] = await sql`SELECT pg_backend_pid() AS pid`
    const deadline = Date.now() + 30_000
    let connected = true
    while (connected && Date.now() < deadline) {
      const [row] = await observer`
          SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE pid = ${first.pid}) AS connected`
      connected = row.connected
      if (connected) await Bun.sleep(250)
    }
    expect(connected).toBe(false)
    const [next] = await sql`SELECT pg_backend_pid() AS pid, 42 AS answer`
    expect(next.pid).not.toBe(first.pid)
    expect(next.answer).toBe(42)
  } finally {
    await sql.end({ timeout: 1 })
    await observer.end({ timeout: 1 })
  }
}, 35_000)

test('the owner CLI replays safely and keeps its journal private from runtime', async () => {
  const admin = postgres(url, { max: 1, onnotice: () => {} })
  const name = 'datepot_connections_' + randomUUID().replaceAll('-', '')
  const owner = name + '_owner'
  const runtime = name + '_runtime'
  const clients: ReturnType<typeof database>[] = []
  const roleUrl = (role: string) => {
    const value = new URL(url)
    value.pathname = '/' + name
    value.username = role
    value.password = ''
    return value.toString()
  }
  const runMigration = async () => {
    const child = Bun.spawn([process.execPath, 'server/migrate.ts'], {
      env: { ...process.env, DATABASE_URL: roleUrl(owner) },
      stdout: 'pipe',
      stderr: 'pipe'
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited
    ])
    expect(exitCode, stderr).toBe(0)
    expect(stdout).toContain('The Date Pot schema is ready')
  }
  try {
    await admin`CREATE ROLE ${admin(owner)} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE CONNECTION LIMIT 1`
    await admin`CREATE ROLE ${admin(runtime)} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE CONNECTION LIMIT 8`
    await admin`CREATE DATABASE ${admin(name)} OWNER ${admin(owner)}`
    const ownerSql = migrationDatabase(roleUrl(owner))
    clients.push(ownerSql)
    await ownerSql`REVOKE CREATE ON SCHEMA public FROM PUBLIC`
    await ownerSql`ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${ownerSql(runtime)}`
    await ownerSql.end()

    await runMigration()
    const journalSql = migrationDatabase(roleUrl(owner))
    clients.push(journalSql)
    const journal =
      await journalSql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id`
    expect(journal).toHaveLength(2)
    await journalSql.end()

    const runtimeSql = database(roleUrl(runtime))
    clients.push(runtimeSql)
    const db = orm(runtimeSql)
    await db.insert(beerType).values({ beerType: 'Connection test' })
    await runMigration()
    expect(await db.select().from(beerType)).toMatchObject([
      { beerType: 'Connection test' }
    ])
    const replaySql = migrationDatabase(roleUrl(owner))
    clients.push(replaySql)
    expect(
      await replaySql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id`
    ).toEqual(journal)
    await expect(
      runtimeSql`SELECT * FROM drizzle.__drizzle_migrations`
    ).rejects.toMatchObject({ code: '42501' })
    await expect(
      runtimeSql`CREATE TABLE public.forbidden (id int)`
    ).rejects.toMatchObject({ code: '42501' })
  } finally {
    await Promise.all(clients.map((sql) => sql.end({ timeout: 1 })))
    await admin`DROP DATABASE IF EXISTS ${admin(name)} WITH (FORCE)`
    await admin`DROP ROLE IF EXISTS ${admin(runtime)}`
    await admin`DROP ROLE IF EXISTS ${admin(owner)}`
    await admin.end({ timeout: 1 })
  }
})
