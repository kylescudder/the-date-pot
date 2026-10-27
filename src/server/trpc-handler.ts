import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { Orm } from './db'
import { appRouter } from './router'

// The Start route supplies Clerk's session; tests supply their own identity.
export function createTrpcHandler(
  db: Orm,
  authenticate: (request: Request) => Promise<string | null>,
  geocode: (address: string) => Promise<number[]>
) {
  return async (request: Request) => {
    let userId: string | null = null
    try {
      userId = await authenticate(request)
    } catch {
      /* authentication fails closed */
    }
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({ db, userId, geocode })
    })
  }
}
