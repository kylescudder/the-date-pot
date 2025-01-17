'use server'

import { db } from '@/server/db'
import { Cuisine, cuisine } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getCuisineList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.cuisine.findMany({})
  } catch (error: any) {
    log.error(`Failed to find cuisines: ${error.message}`)
    throw new Error()
  }
}

export async function addCuisine(Cuisine: Cuisine) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (Cuisine.id === '') {
      Cuisine.id = uuidv4().toString()
    }

    await db
      .update(cuisine)
      .set({
        id: Cuisine.id,
        cuisine: Cuisine.cuisine
      })
      .where(eq(cuisine.id, Cuisine.id))
  } catch (error: any) {
    log.error(`Failed to add cuisine: ${error.message}`)
    throw new Error()
  }
}
