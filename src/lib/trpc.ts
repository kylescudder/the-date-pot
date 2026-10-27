import type { QueryClient } from '@tanstack/react-query'
import type { TRPCClient } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../server/router'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

// The signed-in session's clients, for event handlers outside React hooks.
let session: { client: TRPCClient<AppRouter>; queryClient: QueryClient }

export function setSession(value: typeof session) {
  session = value
}

export function api() {
  return session.client
}

// Everything shown is group data, so a change refreshes all of it.
export function refresh() {
  return session.queryClient.invalidateQueries()
}
