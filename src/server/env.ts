import '@tanstack/react-start/server-only'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

type RuntimeEnv = Record<string, string | undefined>

const databaseSchema = {
  DATABASE_URL: z.url().refine((value) => {
    if (!URL.canParse(value)) return false
    const url = new URL(value)
    return (
      ['postgres:', 'postgresql:'].includes(url.protocol) &&
      !!url.hostname &&
      !!url.pathname.replace(/\//g, '')
    )
  })
}

const origin = z
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false
    const url = new URL(value)
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    )
  })
  .transform((value) => new URL(value).origin)

const validation = {
  emptyStringAsUndefined: true,
  onValidationError(issues: readonly { path?: readonly unknown[] }[]): never {
    // Report setting names only; credentials must never appear in startup logs.
    throw new Error(
      'Invalid environment variables: ' +
        issues.map((issue) => issue.path?.join('.')).join(', ')
    )
  }
}

// Read at runtime, rather than during Vite's secret-free production build.
export function readDatabaseEnv(runtimeEnv: RuntimeEnv = process.env) {
  return createEnv({ server: databaseSchema, runtimeEnv, ...validation })
}

export function readEnv(runtimeEnv: RuntimeEnv = process.env) {
  return createEnv({
    server: {
      ...databaseSchema,
      APP_ORIGIN: origin,
      CLERK_PUBLISHABLE_KEY: z.string().min(1),
      CLERK_SECRET_KEY: z.string().min(1),
      PORT: z.coerce.number().int().min(1).max(65535).default(3000),
      NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
      DATE_POT_REVISION: z.string().default('unknown'),
      // Server-side geocoding for the map on coffee, restaurant and activity pages
      GOOGLE_MAPS_API_KEY_GEOCODING: z.string().min(1).optional()
    },
    runtimeEnv,
    ...validation
  })
}
