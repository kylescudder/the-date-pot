import '@tanstack/react-start/server-only'
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { readEnv } from './env'

export function requestOptions() {
  const env = readEnv()
  // Better Auth reads its own cookie per request; Clerk is not loaded at all.
  if (env.AUTH_PROVIDER === 'better-auth') return {}
  return {
    requestMiddleware: [
      clerkMiddleware(() => ({
        // Sessions are only accepted for the app's own origin.
        authorizedParties: [env.APP_ORIGIN]
      }))
    ]
  }
}
