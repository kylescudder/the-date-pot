import '@tanstack/react-start/server-only'
import { readEnv } from './env'
import { getBetterAuth, getOrm } from './auth'

// The image library loads on first use, not at startup.
export async function handleProfileRequest(request: Request) {
  const env = readEnv()
  const { createProfileHandler } = await import('./profile-handler')
  return createProfileHandler(getOrm(), {
    origin: new URL(env.BETTER_AUTH_URL).origin,
    allowedEmails: env.AUTH_ALLOWED_EMAILS,
    getSession: (headers) => getBetterAuth().api.getSession({ headers })
  })(request)
}
