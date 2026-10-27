import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  activity,
  restaurant,
  restaurantCuisines,
  restaurantWhens,
  vinyl
} from '../db/schema'
import { id, ids, member, notFound, router } from '../trpc'
import { addressInput, nameInput, optionalId } from './shared'

const restaurantInput = z.object({
  id: optionalId,
  name: nameInput,
  address: addressInput,
  archive: z.boolean().nullable().default(false),
  cuisines: ids,
  whens: ids
})

export const restaurantRouter = router({
  list: member.query(({ ctx }) =>
    ctx.db
      .select()
      .from(restaurant)
      .where(
        and(
          eq(restaurant.userGroupId, ctx.groupId),
          eq(restaurant.archive, false)
        )
      )
  ),
  get: member.input(id).query(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select()
      .from(restaurant)
      .where(
        and(eq(restaurant.id, input), eq(restaurant.userGroupId, ctx.groupId))
      )
      .limit(1)
    if (!rows[0]) notFound()
    const [cuisines, whens] = await Promise.all([
      ctx.db
        .select({ id: restaurantCuisines.cuisineId })
        .from(restaurantCuisines)
        .where(eq(restaurantCuisines.restaurantId, input)),
      ctx.db
        .select({ id: restaurantWhens.whenId })
        .from(restaurantWhens)
        .where(eq(restaurantWhens.restaurantId, input))
    ])
    return {
      ...rows[0],
      cuisines: cuisines.map((link) => link.id ?? ''),
      whens: whens.map((link) => link.id ?? ''),
      // Notes have never been stored against a restaurant.
      notes: [] as string[]
    }
  }),
  save: member.input(restaurantInput).mutation(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const values = {
        name: input.name,
        address: input.address,
        archive: input.archive
      }
      const restaurantId = input.id || randomUUID()
      const rows = input.id
        ? await tx
            .update(restaurant)
            .set(values)
            .where(
              and(
                eq(restaurant.id, restaurantId),
                eq(restaurant.userGroupId, ctx.groupId)
              )
            )
            .returning()
        : await tx
            .insert(restaurant)
            .values({ id: restaurantId, ...values, userGroupId: ctx.groupId })
            .returning()
      if (!rows[0]) notFound()
      // The form always sends the complete selection.
      await tx
        .delete(restaurantCuisines)
        .where(eq(restaurantCuisines.restaurantId, restaurantId))
      if (input.cuisines.length)
        await tx.insert(restaurantCuisines).values(
          input.cuisines.map((cuisineId) => ({
            id: randomUUID(),
            restaurantId,
            cuisineId
          }))
        )
      await tx
        .delete(restaurantWhens)
        .where(eq(restaurantWhens.restaurantId, restaurantId))
      if (input.whens.length)
        await tx.insert(restaurantWhens).values(
          input.whens.map((whenId) => ({
            id: randomUUID(),
            restaurantId,
            whenId
          }))
        )
      return rows[0]
    })
  ),
  archive: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .update(restaurant)
      .set({ archive: true })
      .where(
        and(eq(restaurant.id, input), eq(restaurant.userGroupId, ctx.groupId))
      )
      .returning({ id: restaurant.id })
    if (!rows.length) notFound()
    return { ok: true }
  })
})

const activityInput = z.object({
  id: optionalId,
  name: nameInput,
  address: addressInput,
  archive: z.boolean().nullable().default(false),
  expenseId: z.uuid().nullable()
})

export const activityRouter = router({
  list: member.query(({ ctx }) =>
    ctx.db
      .select()
      .from(activity)
      .where(
        and(eq(activity.userGroupId, ctx.groupId), eq(activity.archive, false))
      )
  ),
  get: member.input(id).query(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select()
      .from(activity)
      .where(and(eq(activity.id, input), eq(activity.userGroupId, ctx.groupId)))
      .limit(1)
    if (!rows[0]) notFound()
    return rows[0]
  }),
  save: member.input(activityInput).mutation(async ({ ctx, input }) => {
    const values = {
      name: input.name,
      address: input.address,
      archive: input.archive,
      expenseId: input.expenseId
    }
    const rows = input.id
      ? await ctx.db
          .update(activity)
          .set(values)
          .where(
            and(
              eq(activity.id, input.id),
              eq(activity.userGroupId, ctx.groupId)
            )
          )
          .returning()
      : await ctx.db
          .insert(activity)
          .values({ id: randomUUID(), ...values, userGroupId: ctx.groupId })
          .returning()
    if (!rows[0]) notFound()
    return rows[0]
  }),
  archive: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .update(activity)
      .set({ archive: true })
      .where(and(eq(activity.id, input), eq(activity.userGroupId, ctx.groupId)))
      .returning({ id: activity.id })
    if (!rows.length) notFound()
    return { ok: true }
  })
})

const vinylInput = z.object({
  id: optionalId,
  name: nameInput,
  artist: nameInput,
  archive: z.boolean().nullable().default(false),
  purchased: z.boolean().nullable().default(false)
})

export const vinylRouter = router({
  list: member.query(({ ctx }) =>
    ctx.db
      .select()
      .from(vinyl)
      .where(and(eq(vinyl.userGroupId, ctx.groupId), eq(vinyl.archive, false)))
  ),
  get: member.input(id).query(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select()
      .from(vinyl)
      .where(and(eq(vinyl.id, input), eq(vinyl.userGroupId, ctx.groupId)))
      .limit(1)
    if (!rows[0]) notFound()
    return rows[0]
  }),
  save: member.input(vinylInput).mutation(async ({ ctx, input }) => {
    const values = {
      name: input.name,
      artist: input.artist,
      archive: input.archive,
      purchased: input.purchased
    }
    const rows = input.id
      ? await ctx.db
          .update(vinyl)
          .set(values)
          .where(
            and(eq(vinyl.id, input.id), eq(vinyl.userGroupId, ctx.groupId))
          )
          .returning()
      : await ctx.db
          .insert(vinyl)
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
      .update(vinyl)
      .set({ archive: true })
      .where(and(eq(vinyl.id, input), eq(vinyl.userGroupId, ctx.groupId)))
      .returning({ id: vinyl.id })
    if (!rows.length) notFound()
    return { ok: true }
  })
})
