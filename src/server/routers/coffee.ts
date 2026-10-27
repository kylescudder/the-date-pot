import { randomUUID } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { coffee, coffeeRating, user } from '../db/schema'
import type { Orm } from '../db'
import { id, member, notFound, router, stars } from '../trpc'
import { addressInput, nameInput, optionalId } from './shared'
import { averageRating, groupMemberIds } from './helpers'

const coffeeInput = z.object({
  id: optionalId,
  name: nameInput,
  address: addressInput,
  archive: z.boolean().nullable().default(false)
})

const ratingInput = z.object({
  id: optionalId,
  coffeeId: id,
  userId: id,
  experience: stars,
  taste: stars
})

async function ownedCoffee(db: Orm, coffeeId: string, groupId: string) {
  const rows = await db
    .select()
    .from(coffee)
    .where(and(eq(coffee.id, coffeeId), eq(coffee.userGroupId, groupId)))
    .limit(1)
  return rows[0]
}

export const coffeeRouter = router({
  list: member.query(async ({ ctx }) => {
    const coffees = await ctx.db
      .select()
      .from(coffee)
      .where(
        and(eq(coffee.userGroupId, ctx.groupId), eq(coffee.archive, false))
      )
    const ratings = coffees.length
      ? await ctx.db
          .select()
          .from(coffeeRating)
          .where(
            inArray(
              coffeeRating.coffeeId,
              coffees.map((row) => row.id)
            )
          )
      : []
    return coffees.map((row) => {
      const own = ratings.filter((rating) => rating.coffeeId === row.id)
      const avgExperience = own.length
        ? own.reduce((sum, rating) => sum + rating.experience, 0) / own.length
        : 0
      const avgTaste = own.length
        ? own.reduce((sum, rating) => sum + rating.taste, 0) / own.length
        : 0
      return {
        ...row,
        avgExperience,
        avgTaste,
        avgRating: own.length ? averageRating(avgExperience, avgTaste) : 0
      }
    })
  }),
  get: member.input(id).query(async ({ ctx, input }) => {
    const row = await ownedCoffee(ctx.db, input, ctx.groupId)
    if (!row) notFound()
    return row
  }),
  ratings: member.input(id).query(async ({ ctx, input }) => {
    if (!(await ownedCoffee(ctx.db, input, ctx.groupId))) notFound()
    const rows = await ctx.db
      .select({ rating: coffeeRating, username: user.name })
      .from(coffeeRating)
      .innerJoin(user, eq(user.id, coffeeRating.userId))
      .where(eq(coffeeRating.coffeeId, input))
    return rows.map((row) => ({ ...row.rating, username: row.username }))
  }),
  save: member.input(coffeeInput).mutation(async ({ ctx, input }) => {
    const values = {
      name: input.name,
      address: input.address,
      archive: input.archive
    }
    const rows = input.id
      ? await ctx.db
          .update(coffee)
          .set(values)
          .where(
            and(eq(coffee.id, input.id), eq(coffee.userGroupId, ctx.groupId))
          )
          .returning()
      : await ctx.db
          .insert(coffee)
          .values({
            id: randomUUID(),
            ...values,
            addedById: ctx.memberId,
            userGroupId: ctx.groupId
          })
          .returning()
    if (!rows[0]) notFound()
    return rows[0]
  }),
  archive: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .update(coffee)
      .set({ archive: true })
      .where(and(eq(coffee.id, input), eq(coffee.userGroupId, ctx.groupId)))
      .returning({ id: coffee.id })
    if (!rows.length) notFound()
    return { ok: true }
  }),
  saveRating: member.input(ratingInput).mutation(async ({ ctx, input }) => {
    if (!(await ownedCoffee(ctx.db, input.coffeeId, ctx.groupId))) notFound()
    if (!(await groupMemberIds(ctx.db, ctx.groupId)).includes(input.userId))
      notFound()
    const values = {
      coffeeId: input.coffeeId,
      userId: input.userId,
      experience: input.experience,
      taste: input.taste
    }
    const rows = input.id
      ? await ctx.db
          .update(coffeeRating)
          .set(values)
          .where(
            and(
              eq(coffeeRating.id, input.id),
              eq(coffeeRating.coffeeId, input.coffeeId)
            )
          )
          .returning()
      : await ctx.db
          .insert(coffeeRating)
          .values({ id: randomUUID(), ...values })
          .returning()
    if (!rows[0]) notFound()
    return rows[0]
  }),
  deleteRating: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select({ coffeeId: coffeeRating.coffeeId })
      .from(coffeeRating)
      .where(eq(coffeeRating.id, input))
    if (
      !rows[0]?.coffeeId ||
      !(await ownedCoffee(ctx.db, rows[0].coffeeId, ctx.groupId))
    )
      notFound()
    await ctx.db.delete(coffeeRating).where(eq(coffeeRating.id, input))
    return { ok: true }
  })
})
