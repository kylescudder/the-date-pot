'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'
import {
  restaurant,
  restaurantCuisines,
  restaurantNotes,
  restaurantWhens
} from '@/server/db/schema'
import { Restaurants } from '../models/restaurants'

export async function getRestaurantList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .select()
      .from(restaurant)
      .where(and(eq(restaurant.userGroupId, id), eq(restaurant.archive, false)))
  } catch (error: any) {
    throw new Error(`Failed to find restaurants: ${error.message}`)
  }
}
export async function getRestaurant(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

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
    throw new Error(`Failed to find restaurant: ${error.message}`)
  }
}
export async function updateRestaurant(restaurantData: Restaurants) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    if (restaurantData.id === '') {
      restaurantData.id = uuidv4().toString()
    }

    const record = await db
      .insert(restaurant)
      .values({
        id: restaurantData.id,
        restaurantName: restaurantData.restaurantName,
        address: restaurantData.address,
        archive: restaurantData.archive,
        userGroupId: userGroup.id
      })
      .onConflictDoUpdate({
        target: restaurant.id,
        set: {
          restaurantName: restaurantData.restaurantName,
          address: restaurantData.address,
          archive: restaurantData.archive,
          userGroupId: userGroup.id
        }
      })
      .returning()
    console.log(restaurantData)
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
    throw new Error(`Failed to create/update restaurant: ${error.message}`)
  }
}
export async function deleteRestaurantNote(note: string, id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.delete(restaurantNotes).where(eq(restaurantNotes.id, id))
  } catch (error: any) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }
}
export async function addRestaurantNote(note: string, id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(restaurantNotes)
      .set({
        note: note
      })
      .where(eq(restaurantNotes.id, id))
  } catch (error: any) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }
}
export async function archiveRestaurant(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(restaurant)
      .set({
        archive: true
      })
      .where(eq(restaurant.id, id))
  } catch (error: any) {
    throw new Error(`Failed to archive restaurant: ${error.message}`)
  }
}
