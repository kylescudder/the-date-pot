'use server'

import { db } from '@/server/db'
import { Brewery, brewery } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getBreweryList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.brewery.findMany({})
  } catch (error: any) {
    log.error(`Failed to find breweries: ${error.message}`)
    throw new Error()
  }
}

export async function addBrewery(Brewery: Brewery) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

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
    log.error(`Failed to add brewery: ${error.message}`)
    throw new Error()
  }
}
