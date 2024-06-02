'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { Genre, genre } from '@/server/db/schema'
import { eq } from 'drizzle-orm/sql/expressions/conditions'

export async function getGenreList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.genre.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find genres: ${error.message}`)
  }
}

export async function addGenre(genreData: Genre) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

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
    throw new Error(`Failed to add genre: ${error.message}`)
  }
}
