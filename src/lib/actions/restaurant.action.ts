'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'
import {
  restaurant,
  restaurantCuisines,
  restaurantNote,
  restaurantWhens
} from '@/server/db/schema'
import { Restaurants } from '../models/restaurants'
import { log } from '@logtail/next'

export async function getRestaurantList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db
      .select()
      .from(restaurant)
      .where(and(eq(restaurant.userGroupId, id), eq(restaurant.archive, false)))
  } catch (error: any) {
    log.error(`Failed to find restaurants: ${error.message}`)
    throw new Error()
  }
}
export async function getRestaurant(id: string) {
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

    const restaurants = await db
      .select()
      .from(restaurant)
      .where(eq(restaurant.id, id))
      .limit(1)

    const restaurantDetail: Restaurants[] = restaurants.map((restaurant) => ({
      ...restaurant,
      cuisines: [],
      whens: [],
      notes: []
    }))

    const restaurantDetails = restaurantDetail[0]

    const cuisines: string[] = (
      await db.query.restaurantCuisines.findMany({
        columns: {
          cuisineId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.restaurantId, restaurantDetails.id))
        }
      })
    ).map((cuisine) => cuisine.cuisineId || '')

    const whens: string[] = (
      await db.query.restaurantWhens.findMany({
        columns: {
          whenId: true
        },
        where(fields, operators) {
          return operators.and(eq(fields.restaurantId, restaurantDetails.id))
        }
      })
    ).map((when) => when.whenId || '')

    restaurantDetails.cuisines = cuisines
    restaurantDetails.whens = whens

    return restaurantDetails
  } catch (error: any) {
    log.error(`Failed to find restaurant: ${error.message}`)
    throw new Error()
  }
}
export async function updateRestaurant(restaurantData: Restaurants) {
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

    if (restaurantData.id === '') {
      restaurantData.id = uuidv4().toString()
    }

    const record = await db
      .insert(restaurant)
      .values({
        id: restaurantData.id,
        name: restaurantData.name,
        address: restaurantData.address,
        archive: restaurantData.archive,
        userGroupId: userGroup.id
      })
      .onConflictDoUpdate({
        target: restaurant.id,
        set: {
          name: restaurantData.name,
          address: restaurantData.address,
          archive: restaurantData.archive,
          userGroupId: userGroup.id
        }
      })
      .returning()

    restaurantData.cuisines.forEach(async (cuisine) => {
      await db
        .insert(restaurantCuisines)
        .values({
          id: uuidv4().toString(),
          restaurantId: restaurantData.id,
          cuisineId: cuisine
        })
        .onConflictDoUpdate({
          target: [
            restaurantCuisines.restaurantId,
            restaurantCuisines.cuisineId
          ],
          set: {
            restaurantId: restaurantData.id,
            cuisineId: cuisine
          }
        })
    })
    restaurantData.whens.forEach(async (when) => {
      await db
        .insert(restaurantWhens)
        .values({
          id: uuidv4().toString(),
          restaurantId: restaurantData.id,
          whenId: when
        })
        .onConflictDoUpdate({
          target: [restaurantWhens.restaurantId, restaurantWhens.whenId],
          set: {
            restaurantId: restaurantData.id,
            whenId: when
          }
        })
    })

    return record[0]
  } catch (error: any) {
    log.error(`Failed to create/update restaurant: ${error.message}`)
    throw new Error()
  }
}
export async function deleteRestaurantNote(note: string, id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.delete(restaurantNote).where(eq(restaurantNote.id, id))
  } catch (error: any) {
    log.error(`Failed to delete note: ${error.message}`)
    throw new Error()
  }
}
export async function archiveRestaurant(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db
      .update(restaurant)
      .set({
        archive: true
      })
      .where(eq(restaurant.id, id))
  } catch (error: any) {
    log.error(`Failed to archive restaurant: ${error.message}`)
    throw new Error()
  }
}
