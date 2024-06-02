'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'
import {
  Restaurant,
  RestaurantCuisines,
  RestaurantWhens,
  restaurant,
  restaurantCuisines,
  restaurantNote,
  restaurantWhens
} from '@/server/db/schema'

export async function getRestaurantList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.restaurant.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })
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

    return await db.query.restaurant.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find restaurant: ${error.message}`)
  }
}
export async function updateRestaurant(
  restaurantData: Restaurant,
  restaurantCuisineData: RestaurantCuisines,
  restaurantWhenData: RestaurantWhens
) {
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

    await db
      .update(restaurantCuisines)
      .set({
        id: restaurantCuisineData.id,
        restaurantId: restaurantCuisineData.restaurantId,
        cuisineId: restaurantCuisineData.cuisineId
      })
      .where(eq(restaurantCuisines.id, restaurantCuisineData.id))

    await db
      .update(restaurantWhens)
      .set({
        id: restaurantWhenData.id,
        restaurantId: restaurantWhenData.restaurantId,
        whenId: restaurantWhenData.whenId
      })
      .where(eq(restaurantWhens.id, restaurantWhenData.id))

    return await db
      .update(restaurant)
      .set({
        id: restaurantData.id,
        restaurantName: restaurantData.restaurantName,
        address: restaurantData.address,
        archive: restaurantData.archive,
        userGroupId: userGroup.id
      })
      .where(eq(restaurant.id, restaurantData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update restaurant: ${error.message}`)
  }
}
export async function deleteRestaurantNote(note: string, id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.delete(restaurantNote).where(eq(restaurantNote.id, id))
  } catch (error: any) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }
}
export async function addRestaurantNote(note: string, id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(restaurantNote)
      .set({
        note: note
      })
      .where(eq(restaurantNote.id, id))
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
