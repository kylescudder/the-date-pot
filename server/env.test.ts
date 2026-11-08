import { expect, test } from 'bun:test'
import { publicAuthConfig, readEnv } from '../src/server/env'

const better = {
  DATABASE_URL: 'postgres://fixture:password@localhost:5432/app',
  APP_ORIGIN: 'https://thedatepot.example.com',
  BETTER_AUTH_URL: 'https://thedatepot.example.com',
  BETTER_AUTH_SECRET:
    'fixture-secret-that-is-longer-than-thirty-two-characters',
  BREVO_API_KEY: 'fixture-api-key',
  AUTH_EMAIL_FROM: 'hello@example.com'
}

test('Better Auth settings are required', () => {
  const env = readEnv(better)
  expect(env.AUTH_EMAIL_DAILY_LIMIT).toBe(40)
  // Open sign-up: no allowlist unless one is configured.
  expect(env.AUTH_ALLOWED_EMAILS).toEqual([])
  for (const key of [
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
    'BREVO_API_KEY',
    'AUTH_EMAIL_FROM'
  ]) {
    expect(() => readEnv({ ...better, [key]: '' })).toThrow(key)
    expect(() => readEnv({ ...better, [key]: undefined })).toThrow(key)
  }
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
})

test('leftover settings from the previous provider are ignored', () => {
  const env = readEnv({
    ...better,
    NODE_ENV: 'production',
    AUTH_PROVIDER: 'clerk',
    CLERK_PUBLISHABLE_KEY: 'public-fixture',
    CLERK_SECRET_KEY: 'secret-fixture'
  })
  expect(env.BETTER_AUTH_URL).toBe('https://thedatepot.example.com')
  expect(Object.keys(env)).not.toContain('AUTH_PROVIDER')
  expect(Object.keys(env)).not.toContain('CLERK_SECRET_KEY')
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

test('the client learns only whether sign-up is open, never the allowlist', () => {
  expect(publicAuthConfig(readEnv(better))).toEqual({ signUpOpen: true })
  const closed = publicAuthConfig(
    readEnv({
      ...better,
      AUTH_ALLOWED_EMAILS: 'kyle@example.com,partner@example.com'
    })
  )
  expect(closed).toEqual({ signUpOpen: false })
  expect(JSON.stringify(closed)).not.toContain('example.com')
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
