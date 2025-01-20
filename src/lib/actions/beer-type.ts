'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { BeerType, beerType } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { uuidv4 } from '../utils'
import { log } from '@logtail/next'

export async function getBeerTypeList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.beerType.findMany({})
  } catch (error: any) {
    log.error(`Failed to find beer types: ${error.message}`)
    throw new Error()
  }
}

export async function addBeerType(BeerType: BeerType) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (BeerType.id === '') {
      BeerType.id = uuidv4().toString()
    }

    await db
      .update(beerType)
      .set({
        id: BeerType.id,
        beerType: BeerType.beerType
      })
      .where(eq(beerType.id, BeerType.id))
  } catch (error: any) {
    log.error(`Failed to add beer type: ${error.message}`)
    throw new Error()
  }
}
