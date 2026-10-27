import { randomUUID } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import {
  director,
  film,
  filmDirectors,
  filmGenres,
  filmPlatforms,
  genre,
  platform
} from '../db/schema'
import { id, ids, member, notFound, router } from '../trpc'
import { nameInput, optionalId } from './shared'

const filmInput = z.object({
  id: optionalId,
  name: nameInput,
  archive: z.boolean().nullable().default(false),
  addedDate: z.coerce.date(),
  releaseDate: z.coerce.date(),
  runTime: z.coerce.number().int().min(0).max(10000),
  watched: z.boolean().nullable().default(false),
  directors: ids,
  genres: ids,
  platforms: ids
})

export const filmRouter = router({
  list: member.query(async ({ ctx }) => {
    const films = await ctx.db
      .select()
      .from(film)
      .where(and(eq(film.userGroupId, ctx.groupId), eq(film.archive, false)))
    if (!films.length) return []
    const filmIds = films.map((row) => row.id)
    // The list shows names, which its search filters on.
    const [directors, genres, platforms] = await Promise.all([
      ctx.db
        .select({ filmId: filmDirectors.filmId, name: director.directorName })
        .from(filmDirectors)
        .innerJoin(director, eq(filmDirectors.directorId, director.id))
        .where(inArray(filmDirectors.filmId, filmIds)),
      ctx.db
        .select({ filmId: filmGenres.filmId, name: genre.genreText })
        .from(filmGenres)
        .innerJoin(genre, eq(filmGenres.genreId, genre.id))
        .where(inArray(filmGenres.filmId, filmIds)),
      ctx.db
        .select({ filmId: filmPlatforms.filmId, name: platform.platformName })
        .from(filmPlatforms)
        .innerJoin(platform, eq(filmPlatforms.platformId, platform.id))
        .where(inArray(filmPlatforms.filmId, filmIds))
    ])
    const namesFor = (
      links: { filmId: string | null; name: string }[],
      filmId: string
    ) => links.filter((link) => link.filmId === filmId).map((link) => link.name)
    return films.map((row) => ({
      ...row,
      directors: namesFor(directors, row.id),
      genres: namesFor(genres, row.id),
      platforms: namesFor(platforms, row.id)
    }))
  }),
  get: member.input(id).query(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select()
      .from(film)
      .where(and(eq(film.id, input), eq(film.userGroupId, ctx.groupId)))
      .limit(1)
    if (!rows[0]) notFound()
    // The form edits ids.
    const [directors, genres, platforms] = await Promise.all([
      ctx.db
        .select({ id: filmDirectors.directorId })
        .from(filmDirectors)
        .where(eq(filmDirectors.filmId, input)),
      ctx.db
        .select({ id: filmGenres.genreId })
        .from(filmGenres)
        .where(eq(filmGenres.filmId, input)),
      ctx.db
        .select({ id: filmPlatforms.platformId })
        .from(filmPlatforms)
        .where(eq(filmPlatforms.filmId, input))
    ])
    return {
      ...rows[0],
      directors: directors.map((link) => link.id ?? ''),
      genres: genres.map((link) => link.id ?? ''),
      platforms: platforms.map((link) => link.id ?? '')
    }
  }),
  save: member.input(filmInput).mutation(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const values = {
        name: input.name,
        archive: input.archive,
        addedDate: input.addedDate,
        releaseDate: input.releaseDate,
        runTime: input.runTime,
        watched: input.watched
      }
      const filmId = input.id || randomUUID()
      const rows = input.id
        ? await tx
            .update(film)
            .set(values)
            .where(and(eq(film.id, filmId), eq(film.userGroupId, ctx.groupId)))
            .returning()
        : await tx
            .insert(film)
            .values({
              id: filmId,
              ...values,
              addedById: ctx.memberId,
              userGroupId: ctx.groupId
            })
            .returning()
      if (!rows[0]) notFound()
      // The form always sends the complete selection.
      await tx.delete(filmDirectors).where(eq(filmDirectors.filmId, filmId))
      if (input.directors.length)
        await tx.insert(filmDirectors).values(
          input.directors.map((directorId) => ({
            id: randomUUID(),
            filmId,
            directorId
          }))
        )
      await tx.delete(filmGenres).where(eq(filmGenres.filmId, filmId))
      if (input.genres.length)
        await tx.insert(filmGenres).values(
          input.genres.map((genreId) => ({
            id: randomUUID(),
            filmId,
            genreId
          }))
        )
      await tx.delete(filmPlatforms).where(eq(filmPlatforms.filmId, filmId))
      if (input.platforms.length)
        await tx.insert(filmPlatforms).values(
          input.platforms.map((platformId) => ({
            id: randomUUID(),
            filmId,
            platformId
          }))
        )
      return rows[0]
    })
  ),
  archive: member.input(id).mutation(async ({ ctx, input }) => {
    const rows = await ctx.db
      .update(film)
      .set({ archive: true })
      .where(and(eq(film.id, input), eq(film.userGroupId, ctx.groupId)))
      .returning({ id: film.id })
    if (!rows.length) notFound()
    return { ok: true }
  })
})
