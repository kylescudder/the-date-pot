// Self-contained e2e run: `bun run test:e2e [playwright args]`.
//
// 1. Starts a throwaway Postgres cluster (initdb in a temp dir, free port),
//    unless E2E_DATABASE_URL already names a disposable local database.
// 2. Migrates it and seeds a throwaway, verified password user. The random
//    credentials exist only in this process and the Playwright child.
// 3. Builds the app, then runs Playwright. playwright.config.ts starts the
//    production server against the throwaway database on a free port.
// 4. Stops the cluster and deletes its directory, even on failure.
//
// No production data, accounts or secrets are used.
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hashPassword } from 'better-auth/crypto'
import postgres from 'postgres'

// Per-repository settings.
const DATABASE_NAME = 'date_pot_e2e'
const MIGRATE = ['bun', 'server/migrate.ts']
const BUILD = ['bun', 'run', 'build']

const run = (command: string[], env: NodeJS.ProcessEnv = process.env) => {
  const result = spawnSync(command[0], command.slice(1), {
    stdio: 'inherit',
    env
  })
  if (result.status !== 0)
    throw new Error(`${command.join(' ')} exited with ${result.status}`)
}

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number }
      server.close(() => resolve(port))
    })
  })

const cleanup: (() => Promise<void> | void)[] = []
async function teardown() {
  for (const step of cleanup.reverse()) {
    try {
      await step()
    } catch (error) {
      console.error('e2e cleanup:', error)
    }
  }
  cleanup.length = 0
}
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => void teardown().then(() => process.exit(130)))

async function throwawayDatabase() {
  const external = process.env.E2E_DATABASE_URL
  if (external) {
    const url = new URL(external)
    if (!['localhost', '127.0.0.1'].includes(url.hostname))
      throw new Error('E2E_DATABASE_URL must be a local disposable database.')
    if (!url.pathname.slice(1).startsWith('date_pot_e2e'))
      throw new Error('Use a date_pot_e2e disposable database.')
    return external
  }
  if (spawnSync('initdb', ['--version']).status !== 0)
    throw new Error(
      'initdb not found. Install Postgres (brew install postgresql@18) or set E2E_DATABASE_URL to a disposable local database.'
    )
  const dir = await mkdtemp(join(tmpdir(), `${DATABASE_NAME}-`))
  cleanup.push(() => rm(dir, { recursive: true, force: true }))
  const data = join(dir, 'data')
  const port = await freePort()
  // macOS Postgres refuses to start without a valid locale in the
  // environment; TCP only, because temp-dir socket paths can exceed the limit.
  const pgEnv = { ...process.env, LC_ALL: 'C', LANG: 'C' }
  run(
    [
      'initdb',
      '-D',
      data,
      '-U',
      'postgres',
      '--auth=trust',
      '-E',
      'UTF8',
      '--locale=C',
      '--no-instructions'
    ],
    pgEnv
  )
  run(
    [
      'pg_ctl',
      '-D',
      data,
      '-l',
      join(dir, 'postgres.log'),
      '-o',
      `-p ${port} -c listen_addresses=127.0.0.1 -c unix_socket_directories=''`,
      '-w',
      'start'
    ],
    pgEnv
  )
  cleanup.push(() =>
    run(['pg_ctl', '-D', data, '-m', 'fast', '-w', 'stop'], pgEnv)
  )
  const admin = postgres(`postgres://postgres@127.0.0.1:${port}/postgres`, {
    max: 1,
    onnotice: () => {}
  })
  await admin.unsafe(`CREATE DATABASE ${DATABASE_NAME}`)
  await admin.end()
  return `postgres://postgres@127.0.0.1:${port}/${DATABASE_NAME}`
}

async function seedUser(databaseUrl: string) {
  const email = `e2e-${randomUUID()}@example.test`
  const password = randomBytes(24).toString('base64url')
  const userId = randomUUID()
  const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} })
  try {
    await sql.unsafe(
      await Bun.file(
        new URL('../tests/fixtures/seed.sql', import.meta.url)
      ).text()
    )
    await sql`INSERT INTO auth_user (id, name, email, email_verified)
      VALUES (${userId}, 'E2E Tester', ${email}, true)`
    await sql`INSERT INTO auth_account (id, account_id, provider_id, user_id, password)
      VALUES (${randomUUID()}, ${userId}, 'credential', ${userId}, ${await hashPassword(password)})`
    await sql`UPDATE "user" SET auth_user_id = ${userId} WHERE id = '22222222-2222-4222-8222-222222222221'`
  } finally {
    await sql.end()
  }
  return { email, password }
}

let exitCode = 1
try {
  const databaseUrl = await throwawayDatabase()
  run(MIGRATE, { ...process.env, DATABASE_URL: databaseUrl })
  const user = await seedUser(databaseUrl)
  if (process.env.E2E_SKIP_BUILD !== '1') run(BUILD)

  const port = await freePort()
  const origin = `http://localhost:${port}`
  const child = spawn(
    'bunx',
    ['--no-install', 'playwright', 'test', ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        E2E_PORT: String(port),
        E2E_BASE_URL: origin,
        E2E_DATABASE_URL: databaseUrl,
        E2E_USERNAME: user.email,
        E2E_PASSWORD: user.password,
        // Production server settings for the throwaway environment. Email is
        // never sent: the seeded user signs in with a password.
        NODE_ENV: 'test',
        PORT: String(port),
        DATABASE_URL: databaseUrl,
        APP_ORIGIN: origin,
        BETTER_AUTH_URL: origin,
        BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
        BREVO_API_KEY: 'e2e-unused',
        AUTH_EMAIL_FROM: 'e2e@example.test',
        AUTH_ALLOWED_EMAILS: user.email
      }
    }
  )
  exitCode = await new Promise<number>((resolve) =>
    child.on('exit', (code) => resolve(code ?? 1))
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
} finally {
  await teardown()
}
process.exit(exitCode)
