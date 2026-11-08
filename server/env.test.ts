import { expect, test } from 'bun:test'
import { readEnv } from '../src/server/env'

const clerk = {
  DATABASE_URL: 'postgres://fixture:password@localhost:5432/app',
  APP_ORIGIN: 'https://thedatepot.example.com',
  CLERK_PUBLISHABLE_KEY: 'public-fixture',
  CLERK_SECRET_KEY: 'secret-fixture'
}
const better = {
  DATABASE_URL: clerk.DATABASE_URL,
  APP_ORIGIN: clerk.APP_ORIGIN,
  AUTH_PROVIDER: 'better-auth',
  BETTER_AUTH_URL: 'https://thedatepot.example.com',
  BETTER_AUTH_SECRET:
    'fixture-secret-that-is-longer-than-thirty-two-characters',
  BREVO_API_KEY: 'fixture-api-key',
  AUTH_EMAIL_FROM: 'hello@example.com'
}

test('Clerk stays the default and still requires its keys', () => {
  expect(readEnv(clerk).AUTH_PROVIDER).toBe('clerk')
  expect(() => readEnv({ ...clerk, CLERK_SECRET_KEY: '' })).toThrow(
    'CLERK_SECRET_KEY'
  )
  expect(() => readEnv({ ...clerk, CLERK_PUBLISHABLE_KEY: undefined })).toThrow(
    'CLERK_PUBLISHABLE_KEY'
  )
  expect(() => readEnv({ ...clerk, AUTH_PROVIDER: 'unknown' })).toThrow(
    'AUTH_PROVIDER'
  )
})

test('Better Auth settings are required only when it is selected', () => {
  const env = readEnv(better)
  expect(env.AUTH_PROVIDER).toBe('better-auth')
  expect(env.CLERK_SECRET_KEY).toBeUndefined()
  expect(env.AUTH_EMAIL_DAILY_LIMIT).toBe(40)
  // Open sign-up: no allowlist unless one is configured.
  expect(env.AUTH_ALLOWED_EMAILS).toEqual([])
  for (const key of [
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
    'BREVO_API_KEY',
    'AUTH_EMAIL_FROM'
  ])
    expect(() => readEnv({ ...better, [key]: '' })).toThrow(key)
  expect(() => readEnv({ ...better, BETTER_AUTH_SECRET: 'short' })).toThrow(
    'BETTER_AUTH_SECRET'
  )
  expect(() =>
    readEnv({
      ...better,
      NODE_ENV: 'production',
      BETTER_AUTH_URL: 'http://thedatepot.example.com'
    })
  ).toThrow('BETTER_AUTH_URL')
  expect(() => readEnv({ ...better, AUTH_EMAIL_DAILY_LIMIT: '301' })).toThrow(
    'AUTH_EMAIL_DAILY_LIMIT'
  )
  // Keeping both sets of settings supports a configuration-only rollback.
  expect(
    readEnv({ ...clerk, ...better, AUTH_PROVIDER: 'clerk' }).AUTH_PROVIDER
  ).toBe('clerk')
})

test('an optional email allowlist is trimmed, lowercased and validated', () => {
  expect(
    readEnv({
      ...better,
      AUTH_ALLOWED_EMAILS: ' Kyle@Example.com, partner@example.com ,'
    }).AUTH_ALLOWED_EMAILS
  ).toEqual(['kyle@example.com', 'partner@example.com'])
  expect(() => readEnv({ ...better, AUTH_ALLOWED_EMAILS: 'nope' })).toThrow(
    'AUTH_ALLOWED_EMAILS'
  )
})

test('configuration errors name settings without printing their values', () => {
  const secret = 'do-not-print-this-secret'
  try {
    readEnv({ ...better, BETTER_AUTH_SECRET: secret.slice(0, 10) })
    throw new Error('invalid configuration was accepted')
  } catch (error) {
    expect((error as Error).message).toContain('BETTER_AUTH_SECRET')
    expect((error as Error).message).not.toContain(secret.slice(0, 10))
  }
})
