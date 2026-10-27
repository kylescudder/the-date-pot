import { initTRPC, TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import superjson from 'superjson'
import { z } from 'zod'
import type { Orm } from './db'
import { user, userGroups } from './db/schema'

export type Context = {
  db: Orm
  userId: string | null
  geocode: (address: string) => Promise<number[]>
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return error.code === 'INTERNAL_SERVER_ERROR'
      ? {
          ...shape,
          message: 'The request could not be completed',
          data: { ...shape.data, stack: undefined }
        }
      : shape
  }
})

export const router = t.router

const authenticated = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// A member is a signed-in Clerk user with a user row and a group. Identity and
// group always come from the session, never from the request body.
export const member = authenticated.use(async ({ ctx, next }) => {
  const rows = await ctx.db
    .select({ id: user.id, groupId: userGroups.groupId })
    .from(user)
    .innerJoin(userGroups, eq(userGroups.userId, user.id))
    .where(eq(user.clerkId, ctx.userId))
    .limit(1)
  const row = rows[0]
  if (!row?.groupId)
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This account is not part of a date pot yet'
    })
  return next({
    ctx: { ...ctx, memberId: row.id, groupId: row.groupId }
  })
})

export const id = z.uuid()
export const text = z.string().trim()
export const ids = z.array(z.uuid()).max(100)
// Star ratings move in half steps from 0 to 5.
export const stars = z
  .number()
  .min(0)
  .max(5)
  .refine((value) => Number.isInteger(value * 2), 'Use half-star steps')

export function notFound(): never {
  throw new TRPCError({ code: 'NOT_FOUND' })
}
