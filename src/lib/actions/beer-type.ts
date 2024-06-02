'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { BeerType, beerType } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { uuidv4 } from '../utils'

export async function getBeerTypeList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.beerType.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find beer types: ${error.message}`)
  }
}

export async function addBeerType(BeerType: BeerType) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

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
    throw new Error(`Failed to add beer type: ${error.message}`)
  }
}
