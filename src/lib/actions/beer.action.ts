'use server'

import { db } from '@/server/db'
import {
  BeerRating,
  beer,
  beerBreweries,
  beerRating,
  beerTypes,
  user
} from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'
import { Beers } from '../models/beers'
import { BeerRatings } from '../models/beerRatings'
import { log } from '@logtail/next'

export async function getBeerList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const beers = await db
      .select()
      .from(beer)
      .where(and(eq(beer.userGroupId, id), eq(beer.archive, false)))

    const beersWithRating: Beers[] = beers.map((beer) => ({
      ...beer,
      avgWankyness: 0,
      avgTaste: 0,
      avgRating: 0,
      breweries: [],
      beerTypes: []
    }))

    await Promise.all(
      beersWithRating.map(async (element: Beers) => {
        const beerRatings: BeerRating[] = await db.query.beerRating.findMany({
          where(fields, operators) {
            return operators.and(eq(fields.beerId, element.id))
          }
        })
        if (beerRatings.length === 0) return

        let wankyness = 0
        let taste = 0
        await Promise.all(
          beerRatings.map(async (rec) => {
            wankyness += rec.wankyness
            taste += rec.taste
          })
        )

        element.avgWankyness = wankyness /= beerRatings.length
        element.avgTaste = taste /= beerRatings.length
        const avg = (wankyness + taste) / beerRatings.length
        element.avgRating = Math.round(avg * 2) / 2
      })
    )
    return beersWithRating
  } catch (error: any) {
    log.error(`Failed to find beers: ${error.message}`)
    throw new Error()
  }
}

export async function getBeer(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) {
      log.error('User info not found')
      throw new Error()
    }
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) {
      log.error('User group info not found')
      throw new Error()
    }

    const beers = await db.select().from(beer).where(eq(beer.id, id)).limit(1)

    const beerDetail: Beers[] = beers.map((beer) => ({
      ...beer,
      avgWankyness: 0,
      avgTaste: 0,
      avgRating: 0,
      breweries: [],
      beerTypes: []
    }))

    const beerDetails: Beers = beerDetail[0]

    const breweries: string[] = (
      await db.query.beerBreweries.findMany({
        columns: {
          breweryId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.beerId, beerDetails.id))
        }
      })
    ).map((brewery) => brewery.breweryId || '')

    const beerTypes: string[] = (
      await db.query.beerTypes.findMany({
        columns: {
          beerTypeId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.beerId, beerDetails.id))
        }
      })
    ).map((beerType) => beerType.beerTypeId || '')

    beerDetails.breweries = breweries
    beerDetails.beerTypes = beerTypes

    return beerDetails
  } catch (error: any) {
    log.error(`Failed to find beer: ${error.message}`)
    throw new Error()
  }
}
export async function getBeerRatings(id: string) {
  try {
    const authUser = await auth()

    if (!authUser.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const extenededBeerRating = await db
      .select()
      .from(beerRating)
      .innerJoin(user, eq(user.id, beerRating.userId))
      .where(eq(beerRating.beerId, id))

    const beerRatings: BeerRatings[] = extenededBeerRating.map((beerRating) => {
      return {
        id: beerRating.beerRating.id,
        beerId: beerRating.beerRating.beerId,
        userId: beerRating.beerRating.userId,
        wankyness: beerRating.beerRating.wankyness,
        taste: beerRating.beerRating.taste,
        username: beerRating.user.name
      }
    })

    return beerRatings
  } catch (error: any) {
    log.error(`Failed to find beer ratings: ${error.message}`)
    throw new Error()
  }
}
export async function deleteBeerRating(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    await db.delete(beerRating).where(eq(beerRating.id, id))
  } catch (error: any) {
    log.error(`Failed to delete beer ratings: ${error.message}`)
    throw new Error()
  }
}
export async function updateBeerRating(beerRatingData: BeerRatings) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (beerRatingData.id === '') {
      beerRatingData.id = uuidv4().toString()
    }

    const records = await db
      .insert(beerRating)
      .values({
        id: beerRatingData.id,
        beerId: beerRatingData.beerId,
        userId: beerRatingData.userId,
        wankyness: beerRatingData.wankyness,
        taste: beerRatingData.taste
      })
      .onConflictDoUpdate({
        target: beerRating.id,
        set: {
          beerId: beerRatingData.beerId,
          userId: beerRatingData.userId,
          wankyness: beerRatingData.wankyness,
          taste: beerRatingData.taste
        }
      })
      .returning()

    return records[0]
  } catch (error: any) {
    log.error(`Failed to create/update beer ratings: ${error.message}`)
    throw new Error()
  }
}
export async function updateBeer(beerData: Beers) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) {
      log.error('User info not found')
      throw new Error()
    }
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) {
      log.error('User group info not found')
      throw new Error()
    }

    if (beerData.id === '') {
      beerData.id = uuidv4().toString()
    }

    const record = await db
      .insert(beer)
      .values({
        id: beerData.id,
        name: beerData.name,
        abv: beerData.abv,
        archive: beerData.archive,
        addedById: userInfo.id,
        userGroupId: userGroup.id
      })
      .onConflictDoUpdate({
        target: beer.id,
        set: {
          name: beerData.name,
          abv: beerData.abv,
          archive: beerData.archive,
          addedById: userInfo.id,
          userGroupId: userGroup.id
        }
      })
      .returning()

    beerData.breweries.forEach(async (brewery) => {
      await db
        .insert(beerBreweries)
        .values({
          id: uuidv4().toString(),
          beerId: beerData.id,
          breweryId: brewery
        })
        .onConflictDoUpdate({
          target: [beerBreweries.beerId, beerBreweries.breweryId],
          set: {
            beerId: beerData.id,
            breweryId: brewery
          }
        })
    })
    beerData.beerTypes.forEach(async (beerType) => {
      await db
        .insert(beerTypes)
        .values({
          id: uuidv4().toString(),
          beerId: beerData.id,
          beerTypeId: beerType
        })
        .onConflictDoUpdate({
          target: [beerTypes.beerId, beerTypes.beerTypeId],
          set: {
            beerId: beerData.id,
            beerTypeId: beerType
          }
        })
    })

    return record[0]
  } catch (error: any) {
    log.error(`Failed to create/update beer: ${error.message}`)
    throw new Error()
  }
}
export async function archiveBeer(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    await db
      .update(beer)
      .set({
        archive: true
      })
      .where(eq(beer.id, id))
  } catch (error: any) {
    log.error(`Failed to archive beer: ${error.message}`)
    throw new Error()
  }
}
