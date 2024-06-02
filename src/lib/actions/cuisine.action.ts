'use server'

import { db } from '@/server/db'
import { Cuisine, cuisine } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'

export async function getCuisineList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.cuisine.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find cuisines: ${error.message}`)
  }
}

export async function addCuisine(Cuisine: Cuisine) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

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
    throw new Error(`Failed to add cuisine: ${error.message}`)
  }
}
