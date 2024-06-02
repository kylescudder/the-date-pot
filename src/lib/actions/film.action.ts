'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import {
  Film,
  FilmDirectors,
  FilmGenres,
  FilmPlatforms,
  film,
  filmDirectors,
  filmGenres,
  filmPlatforms
} from '@/server/db/schema'
import { uuidv4 } from '../utils'

export async function getFilmList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.film.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find films: ${error.message}`)
  }
}
export async function getFilm(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    return await db.query.film.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find film: ${error.message}`)
  }
}
export async function updateFilm(
  filmData: Film,
  filmDirectorData: FilmDirectors,
  filmGenreData: FilmGenres,
  filmPlatformData: FilmPlatforms
) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    if (filmData.id === '') {
      filmData.id = uuidv4().toString()
    }

    await db
      .update(filmDirectors)
      .set({
        id: filmDirectorData.id,
        filmId: filmDirectorData.filmId,
        directorId: filmDirectorData.directorId
      })
      .where(eq(filmDirectors.id, filmDirectorData.id))

    await db
      .update(filmGenres)
      .set({
        id: filmGenreData.id,
        filmId: filmGenreData.filmId,
        genreId: filmGenreData.genreId
      })
      .where(eq(filmGenres.id, filmGenreData.id))

    await db
      .update(filmPlatforms)
      .set({
        id: filmPlatformData.id,
        filmId: filmPlatformData.filmId,
        platformId: filmPlatformData.platformId
      })
      .where(eq(filmPlatforms.id, filmPlatformData.id))

    return await db
      .update(film)
      .set({
        id: filmData.id,
        addedDate: filmData.addedDate,
        archive: filmData.archive,
        filmName: filmData.filmName,
        releaseDate: filmData.releaseDate,
        runTime: filmData.runTime,
        userGroupId: userGroup.id,
        watched: filmData.watched
      })
      .where(eq(film.id, filmData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update film: ${error.message}`)
  }
}
export async function archiveFilm(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(film)
      .set({
        archive: true
      })
      .where(eq(film.id, id))
  } catch (error: any) {
    throw new Error(`Failed to archive film: ${error.message}`)
  }
}
