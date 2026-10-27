import { auth } from '@clerk/tanstack-react-start/server'
import { createFileRoute } from '@tanstack/react-router'
import { database, orm } from '@/server/db'
import { readEnv } from '@/server/env'
import { createGeocoder } from '@/server/geocode'
import { createTrpcHandler } from '@/server/trpc-handler'

let handler: ((request: Request) => Promise<Response>) | undefined

// Built on first use so the production build needs no runtime secrets.
function trpc(request: Request) {
  if (!handler) {
    const env = readEnv()
    handler = createTrpcHandler(
      orm(database(env.DATABASE_URL)),
      async () => (await auth({ acceptsToken: 'session_token' })).userId,
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
