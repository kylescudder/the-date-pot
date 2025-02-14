'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { Director, director } from '@/server/db/schema'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getDirectorList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.director.findMany({})
  } catch (error: any) {
    log.error(`Failed to find directors: ${error.message}`)
    throw new Error()
  }
}
export async function addDirector(directorData: Director) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (directorData.id === '') {
      directorData.id = uuidv4().toString()
    }

    await db
      .update(director)
      .set({
        id: directorData.id,
        directorName: directorData.directorName
      })
      .where(eq(director.id, directorData.id))
  } catch (error: any) {
    log.error(`Failed to add director: ${error.message}`)
    throw new Error()
  }
}
