'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { Genre, genre } from '@/server/db/schema'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getGenreList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.genre.findMany({})
  } catch (error: any) {
    log.error(`Failed to find genres: ${error.message}`)
    throw new Error()
  }
}

export async function addGenre(genreData: Genre) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (genreData.id === '') {
      genreData.id = uuidv4().toString()
    }

    await db
      .update(genre)
      .set({
        id: genreData.id,
        genreText: genreData.genreText
      })
      .where(eq(genre.id, genreData.id))
  } catch (error: any) {
    log.error(`Failed to add genre: ${error.message}`)
    throw new Error()
  }
}
