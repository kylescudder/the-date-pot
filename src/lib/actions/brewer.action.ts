'use server'

import { db } from '@/server/db'
import { Brewery, brewery } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'

export async function getBreweryList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.brewery.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find breweries: ${error.message}`)
  }
}

export async function addBrewery(Brewery: Brewery) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    if (Brewery.id === '') {
      Brewery.id = uuidv4().toString()
    }

    await db
      .update(brewery)
      .set({
        id: Brewery.id,
        breweryName: Brewery.breweryName
      })
      .where(eq(brewery.id, Brewery.id))
  } catch (error: any) {
    throw new Error(`Failed to add brewery: ${error.message}`)
  }
}
