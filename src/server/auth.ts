import '@tanstack/react-start/server-only'
import { database, orm } from './db'
import { readEnv } from './env'
import { createDatePotAuth } from './auth-factory'
import { sendLinkEmail, sendLoginEmail } from './auth-email'

let instance: ReturnType<typeof createDatePotAuth> | undefined
let sharedOrm: ReturnType<typeof orm> | undefined

// One application pool for tRPC and auth, created on first use so the
// production build needs no runtime secrets.
export function getOrm() {
  sharedOrm ??= orm(database(readEnv().DATABASE_URL))
  return sharedOrm
}

export function getBetterAuth() {
  if (instance) return instance
  const env = readEnv()
  if (env.AUTH_PROVIDER !== 'better-auth')
    throw new Error('Better Auth is not enabled')
  const origin = new URL(env.BETTER_AUTH_URL!).origin
  const mail = { apiKey: env.BREVO_API_KEY!, from: env.AUTH_EMAIL_FROM! }
  instance = createDatePotAuth(
    getOrm(),
    {
      baseURL: env.BETTER_AUTH_URL!,
      secret: env.BETTER_AUTH_SECRET!,
      allowedEmails: env.AUTH_ALLOWED_EMAILS,
      dailyEmailLimit: env.AUTH_EMAIL_DAILY_LIMIT
    },
    (email, otp) => sendLoginEmail(mail, origin, email, otp),
    (email, kind, url) => sendLinkEmail(mail, origin, email, kind, url)
  )
  return instance
}
