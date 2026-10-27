import { randomUUID } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { beer, beerBreweries, beerRating, beerTypes, user } from '../db/schema'
import type { Orm } from '../db'
import { id, ids, member, notFound, router, stars } from '../trpc'
import { nameInput, optionalId } from './shared'
import { averageRating, groupMemberIds } from './helpers'

const beerInput = z.object({
  id: optionalId,
  name: nameInput,
  abv: z.coerce.number().min(0).max(100),
  archive: z.boolean().nullable().default(false),
  breweries: ids,
  beerTypes: ids
})

const ratingInput = z.object({
  id: optionalId,
  beerId: id,
  userId: id,
  wankyness: stars,
  taste: stars
})

async function ownedBeer(db: Orm, beerId: string, groupId: string) {
  const rows = await db
    .select()
    .from(beer)
    .where(and(eq(beer.id, beerId), eq(beer.userGroupId, groupId)))
    .limit(1)
  return rows[0]
}

export const beerRouter = router({
  list: member.query(async ({ ctx }) => {
    const beers = await ctx.db
      .select()
      .from(beer)
      .where(and(eq(beer.userGroupId, ctx.groupId), eq(beer.archive, false)))
    const ratings = beers.length
      ? await ctx.db
          .select()
          .from(beerRating)
          .where(
            inArray(
              beerRating.beerId,
              beers.map((row) => row.id)
            )
          )
      : []
    return beers.map((row) => {
      const own = ratings.filter((rating) => rating.beerId === row.id)
      const avgWankyness = own.length
        ? own.reduce((sum, rating) => sum + rating.wankyness, 0) / own.length
        : 0
      const avgTaste = own.length
        ? own.reduce((sum, rating) => sum + rating.taste, 0) / own.length
        : 0
      return {
        ...row,
        avgWankyness,
        avgTaste,
        avgRating: own.length ? averageRating(avgWankyness, avgTaste) : 0,
        breweries: [] as string[],
        beerTypes: [] as string[]
      }
    })
  }),
  get: member.input(id).query(async ({ ctx, input }) => {
    const row = await ownedBeer(ctx.db, input, ctx.groupId)
    if (!row) notFound()
    const [breweries, types] = await Promise.all([
      ctx.db
        .select({ id: beerBreweries.breweryId })
        .from(beerBreweries)
        .where(eq(beerBreweries.beerId, input)),
      ctx.db
        .select({ id: beerTypes.beerTypeId })
        .from(beerTypes)
        .where(eq(beerTypes.beerId, input))
    ])
    return {
      ...row,
      avgWankyness: 0,
      avgTaste: 0,
      avgRating: 0,
      breweries: breweries.map((link) => link.id ?? ''),
      beerTypes: types.map((link) => link.id ?? '')
    }
  }),
  ratings: member.input(id).query(async ({ ctx, input }) => {
    if (!(await ownedBeer(ctx.db, input, ctx.groupId))) notFound()
    const rows = await ctx.db
      .select({ rating: beerRating, username: user.name })
      .from(beerRating)
      .innerJoin(user, eq(user.id, beerRating.userId))
      .where(eq(beerRating.beerId, input))
    return rows.map((row) => ({ ...row.rating, username: row.username }))
  }),
  save: member.input(beerInput).mutation(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const values = {
        name: input.name,
        abv: input.abv,
        archive: input.archive
      }
      const beerId = input.id || randomUUID()
      const rows = input.id
        ? await tx
            .update(beer)
            .set(values)
            .where(and(eq(beer.id, beerId), eq(beer.userGroupId, ctx.groupId)))
            .returning()
        : await tx
            .insert(beer)
            .values({
              id: beerId,
              ...values,
              addedById: ctx.memberId,
              userGroupId: ctx.groupId
            })
            .returning()
      if (!rows[0]) notFound()
      // The form always sends the complete selection.
      await tx.delete(beerBreweries).where(eq(beerBreweries.beerId, beerId))
      if (input.breweries.length)
        await tx.insert(beerBreweries).values(
          input.breweries.map((breweryId) => ({
            id: randomUUID(),
            beerId,
            breweryId
          }))
        )
      await tx.delete(beerTypes).where(eq(beerTypes.beerId, beerId))
      if (input.beerTypes.length)
        await tx.insert(beerTypes).values(
          input.beerTypes.map((beerTypeId) => ({
            id: randomUUID(),
            beerId,
            beerTypeId
          }))
        )
      return rows[0]
    })
  ),
  archive: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .update(beer)
      .set({ archive: true })
      .where(and(eq(beer.id, input), eq(beer.userGroupId, ctx.groupId)))
      .returning({ id: beer.id })
    if (!rows.length) notFound()
    return { ok: true }
  }),
  saveRating: member.input(ratingInput).mutation(async ({ ctx, input }) => {
    if (!(await ownedBeer(ctx.db, input.beerId, ctx.groupId))) notFound()
    // Ratings can only be given by members of the same group.
    if (!(await groupMemberIds(ctx.db, ctx.groupId)).includes(input.userId))
      notFound()
    const values = {
      beerId: input.beerId,
      userId: input.userId,
      wankyness: input.wankyness,
      taste: input.taste
    }
    const rows = input.id
      ? await ctx.db
          .update(beerRating)
          .set(values)
          .where(
            and(
              eq(beerRating.id, input.id),
              eq(beerRating.beerId, input.beerId)
            )
          )
          .returning()
      : await ctx.db
          .insert(beerRating)
          .values({ id: randomUUID(), ...values })
          .returning()
    if (!rows[0]) notFound()
    return rows[0]
  }),
  deleteRating: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select({ beerId: beerRating.beerId })
      .from(beerRating)
      .where(eq(beerRating.id, input))
    if (
      !rows[0]?.beerId ||
      !(await ownedBeer(ctx.db, rows[0].beerId, ctx.groupId))
    )
      notFound()
    await ctx.db.delete(beerRating).where(eq(beerRating.id, input))
    return { ok: true }
  })
})
