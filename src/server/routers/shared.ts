import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  beerType,
  brewery,
  cuisine,
  director,
  expense,
  genre,
  platform,
  pot,
  user,
  userGroups,
  when
} from '../db/schema'
import { member, router, text } from '../trpc'

// Shared reference lists. They are global, as they were before the migration.
export const lookupsRouter = router({
  pots: member.query(({ ctx }) =>
    ctx.db.select().from(pot).orderBy(asc(pot.potName))
  ),
  breweries: member.query(({ ctx }) => ctx.db.select().from(brewery)),
  beerTypes: member.query(({ ctx }) => ctx.db.select().from(beerType)),
  cuisines: member.query(({ ctx }) => ctx.db.select().from(cuisine)),
  whens: member.query(({ ctx }) => ctx.db.select().from(when)),
  directors: member.query(({ ctx }) => ctx.db.select().from(director)),
  genres: member.query(({ ctx }) => ctx.db.select().from(genre)),
  platforms: member.query(({ ctx }) => ctx.db.select().from(platform)),
  expenses: member.query(({ ctx }) => ctx.db.select().from(expense))
})

export const usersRouter = router({
  // Confirms the session belongs to a member; the app shell waits on this.
  me: member.query(({ ctx }) => ({ id: ctx.memberId, groupId: ctx.groupId })),
  group: member.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ user })
      .from(user)
      .innerJoin(userGroups, eq(user.id, userGroups.userId))
      .where(eq(userGroups.groupId, ctx.groupId))
    return rows.map((row) => ({ ...row.user, image: '' }))
  })
})

export const mapsRouter = router({
  // Geocoding stays on the server so its API key never reaches the browser.
  lookup: member
    .input(text.max(500))
    .query(({ ctx, input }) => (input ? ctx.geocode(input) : []))
})

export const addressInput = text.max(500)
export const nameInput = text.min(1).max(300)
export const optionalId = z.union([z.literal(''), z.uuid()])
