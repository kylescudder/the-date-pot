'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { sql } from 'drizzle-orm/sql/sql'
import { getUserGroup, getUserInfo } from './user.actions'
import {
  Film,
  FilmDirectors,
  FilmGenres,
  FilmPlatforms,
  director,
  film,
  filmDirectors,
  filmGenres,
  filmPlatforms,
  genre,
  platform
} from '@/server/db/schema'
import { uuidv4 } from '../utils'
import { Films } from '../models/films'
import { log } from '@logtail/next'

export async function getFilmList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const films = await db
      .select()
      .from(film)
      .where(and(eq(film.userGroupId, id), eq(film.archive, false)))

    const filmDetails: Films[] = films.map((film) => ({
      ...film,
      directors: [],
      genres: [],
      platforms: []
    }))

    await Promise.all(
      filmDetails.map(async (element: Films) => {
        const directors = await db
          .select()
          .from(filmDirectors)
          .innerJoin(director, eq(filmDirectors.directorId, director.id))
          .where(sql`${filmDirectors.filmId} = ${element.id}`)

        directors.map((director) => {
          element.directors.push(director.director.directorName)
        })

        const genres = await db
          .select()
          .from(filmGenres)
          .innerJoin(genre, eq(filmGenres.genreId, genre.id))
          .where(sql`${filmGenres.filmId} = ${element.id}`)

        genres.map((genre) => {
          element.genres.push(genre.genre.genreText)
        })

        const platforms = await db
          .select()
          .from(filmPlatforms)
          .innerJoin(platform, eq(filmPlatforms.platformId, platform.id))
          .where(sql`${filmPlatforms.filmId} = ${element.id}`)

        platforms.map((platform) => {
          element.platforms.push(platform.platform.platformName)
        })
      })
    )

    return filmDetails
  } catch (error: any) {
    log.error(`Failed to find films: ${error.message}`)
    throw new Error()
  }
}
export async function getFilm(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) {
      log.error('User info not found')
      throw new Error()
    }
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) {
      log.error('User group info not found')
      throw new Error()
    }

    const films = await db.select().from(film).where(eq(film.id, id)).limit(1)

    const filmDetail: Films[] = films.map((film) => ({
      ...film,
      directors: [],
      genres: [],
      platforms: []
    }))

    const filmDetails = filmDetail[0]

    const directors: string[] = (
      await db.query.filmDirectors.findMany({
        columns: {
          directorId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.filmId, filmDetails.id))
        }
      })
    ).map((director) => director.directorId || '')

    const genres: string[] = (
      await db.query.filmGenres.findMany({
        columns: {
          genreId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.filmId, filmDetails.id))
        }
      })
    ).map((genre) => genre.genreId || '')

    const platforms: string[] = (
      await db.query.filmPlatforms.findMany({
        columns: {
          platformId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.filmId, filmDetails.id))
        }
      })
    ).map((platform) => platform.platformId || '')

    filmDetails.directors = directors
    filmDetails.genres = genres
    filmDetails.platforms = platforms

    return filmDetails
  } catch (error: any) {
    log.error(`Failed to find film: ${error.message}`)
    throw new Error()
  }
}
export async function updateFilm(filmData: Films) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) {
      log.error('User info not found')
      throw new Error()
    }
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) {
      log.error('User group info not found')
      throw new Error()
    }

    if (filmData.id === '') {
      filmData.id = uuidv4().toString()
    }

    const record = await db
      .insert(film)
      .values({
        id: filmData.id,
        addedDate: filmData.addedDate,
        archive: filmData.archive,
        name: filmData.name,
        releaseDate: filmData.releaseDate,
        runTime: filmData.runTime,
        userGroupId: userGroup.id,
        watched: filmData.watched
      })
      .onConflictDoUpdate({
        target: film.id,
        set: {
          addedDate: filmData.addedDate,
          archive: filmData.archive,
          name: filmData.name,
          releaseDate: filmData.releaseDate,
          runTime: filmData.runTime,
          userGroupId: userGroup.id,
          watched: filmData.watched
        }
      })
      .returning()

    filmData.directors.forEach(async (director) => {
      await db
        .insert(filmDirectors)
        .values({
          id: uuidv4().toString(),
          filmId: filmData.id,
          directorId: director
        })
        .onConflictDoUpdate({
          target: [filmDirectors.filmId, filmDirectors.directorId],
          set: {
            filmId: filmData.id,
            directorId: director
          }
        })
    })
    filmData.genres.forEach(async (genre) => {
      await db
        .insert(filmGenres)
        .values({
          id: uuidv4().toString(),
          filmId: filmData.id,
          genreId: genre
        })
        .onConflictDoUpdate({
          target: [filmGenres.filmId, filmGenres.genreId],
          set: {
            filmId: filmData.id,
            genreId: genre
          }
        })
    })
    filmData.platforms.forEach(async (platform) => {
      await db
        .insert(filmPlatforms)
        .values({
          id: uuidv4().toString(),
          filmId: filmData.id,
          platformId: platform
        })
        .onConflictDoUpdate({
          target: [filmPlatforms.filmId, filmPlatforms.platformId],
          set: {
            filmId: filmData.id,
            platformId: platform
          }
        })
    })

    return record[0]
  } catch (error: any) {
    log.error(`Failed to create/update film: ${error.message}`)
    throw new Error()
  }
}
export async function archiveFilm(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db
      .update(film)
      .set({
        archive: true
      })
      .where(eq(film.id, id))
  } catch (error: any) {
    log.error(`Failed to archive film: ${error.message}`)
    throw new Error()
  }
}
