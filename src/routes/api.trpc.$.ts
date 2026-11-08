import { createFileRoute } from '@tanstack/react-router'
import { betterAuthIdentity } from '@/server/app-user'
import { getBetterAuth, getOrm } from '@/server/auth'
import { readEnv } from '@/server/env'
import { createGeocoder } from '@/server/geocode'
import { createTrpcHandler } from '@/server/trpc-handler'

let handler: ((request: Request) => Promise<Response>) | undefined

// Built on first use so the production build needs no runtime secrets.
function trpc(request: Request) {
  if (!handler) {
    const env = readEnv()
    const db = getOrm()
    handler = createTrpcHandler(
      db,
      betterAuthIdentity(db, getBetterAuth(), env.AUTH_ALLOWED_EMAILS),
      createGeocoder(env.GOOGLE_MAPS_API_KEY_GEOCODING)
    )
  }
  return handler(request)
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: ({ request }) => trpc(request),
      POST: ({ request }) => trpc(request)
    }
  }
})
