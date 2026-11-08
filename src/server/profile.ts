import '@tanstack/react-start/server-only'
import { readEnv } from './env'
import { getBetterAuth, getOrm } from './auth'

// Profile photos exist only under Better Auth; with Clerk the route is a 404.
// The image library loads on first use, so Clerk mode never loads it.
export async function handleProfileRequest(request: Request) {
  const env = readEnv()
  if (env.AUTH_PROVIDER !== 'better-auth')
    return new Response('Not found', { status: 404 })
  const { createProfileHandler } = await import('./profile-handler')
  return createProfileHandler(getOrm(), {
    origin: new URL(env.BETTER_AUTH_URL!).origin,
    allowedEmails: env.AUTH_ALLOWED_EMAILS,
    getSession: (headers) => getBetterAuth().api.getSession({ headers })
  })(request)
}
