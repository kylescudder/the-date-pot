import '@tanstack/react-start/server-only'
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { readEnv } from './env'

export function requestOptions() {
  const env = readEnv()
  return {
    requestMiddleware: [
      clerkMiddleware(() => ({
        // Sessions are only accepted for the app's own origin.
        authorizedParties: [env.APP_ORIGIN]
      }))
    ]
  }
}
