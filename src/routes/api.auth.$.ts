import { createFileRoute } from '@tanstack/react-router'
import { getBetterAuth } from '@/server/auth'
import { createAuthRouteHandler } from '@/server/auth-route'

const handler = createAuthRouteHandler(getBetterAuth)

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request)
    }
  }
})
