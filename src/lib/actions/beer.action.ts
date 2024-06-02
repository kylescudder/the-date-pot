'use server'

import { db } from '@/server/db'
import {
  Beer,
  BeerRating,
  BeerBreweries,
  User,
  beer,
  beerBreweries,
  beerRating,
  beerTypes,
  BeerTypes
} from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'

export async function getBeerList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const beers: Beer[] = await db.query.beer.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })

    await Promise.all(
      beers.map(async (element) => {
        const beerRatings: BeerRating[] = await db.query.beerRating.findMany({
          where(fields, operators) {
            return operators.and(eq(fields.beerId, element.id))
          }
        })

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
    return beers
  } catch (error: any) {
    throw new Error(`Failed to find beers: ${error.message}`)
  }
}
export async function getBeer(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    return await db.query.beer.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find beer: ${error.message}`)
  }
}
export async function getBeerRatings(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const ratings: BeerRating[] = await db.query.beerRating.findMany({
      where(fields, operators) {
        return operators.and(eq(fields.beerId, id))
      }
    })

    await Promise.all(
      ratings.map(async (rating) => {
        const u: User | undefined = await db.query.user.findFirst({
          where(fields, operators) {
            if (rating.userId !== null) {
              return operators.and(eq(fields.id, rating.userId))
            }
          }
        })

        if (!u) {
          throw new Error('User not found')
        }

        rating.username = u.name
      })
    )
    return ratings
  } catch (error: any) {
    throw new Error(`Failed to find beer ratings: ${error.message}`)
  }
}
export async function deleteBeerRating(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.beerRating.findFirst({
      where(fields, operators) {
        return operators.and(eq(fields.id, id))
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find beer ratings: ${error.message}`)
  }
}
export async function updateBeerRating(beerRatingData: BeerRating) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    if (beerRatingData.id === '') {
      beerRatingData.id = uuidv4().toString()
    }

    return await db
      .update(beerRating)
      .set({
        id: beerRatingData.id,
        beerId: beerRatingData.beerId,
        userId: beerRatingData.userId,
        wankyness: beerRatingData.wankyness,
        taste: beerRatingData.taste
      })
      .where(eq(beerRating.id, beerRatingData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update beer ratings: ${error.message}`)
  }
}
export async function updateBeer(
  beerData: Beer,
  beerBreweryData: BeerBreweries,
  beerTypeData: BeerTypes
) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    if (beerData.id === '') {
      beerData.id = uuidv4().toString()
    }

    await db
      .update(beerBreweries)
      .set({
        id: beerBreweryData.id,
        beerId: beerBreweryData.beerId,
        breweryId: beerBreweryData.breweryId
      })
      .where(eq(beerBreweries.id, beerBreweryData.id))

    await db
      .update(beerTypes)
      .set({
        id: beerTypeData.id,
        beerId: beerTypeData.beerId,
        beerTypeId: beerTypeData.beerTypeId
      })
      .where(eq(beerTypes.id, beerTypeData.id))

    return await db
      .update(beer)
      .set({
        id: beerData.id,
        beerName: beerData.beerName,
        abv: beerData.abv,
        archive: beerData.archive,
        addedById: userInfo.id,
        userGroupId: userGroup.id
      })
      .where(eq(beerRating.id, beerData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update beer: ${error.message}`)
  }
}
export async function archiveBeer(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(beer)
      .set({
        archive: true
      })
      .where(eq(beer.id, id))
  } catch (error: any) {
    throw new Error(`Failed to archive beer: ${error.message}`)
  }
}
