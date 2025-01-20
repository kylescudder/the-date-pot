'use server'

import { db } from '@/server/db'
import {
  Coffee,
  CoffeeRating,
  coffee,
  coffeeRating,
  user
} from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'
import { Coffees } from '../models/coffees'
import { CoffeeRatings } from '../models/coffeeRatings'
import { log } from '@logtail/next'

export async function getCoffeeList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const coffees = await db
      .select()
      .from(coffee)
      .where(and(eq(coffee.userGroupId, id), eq(coffee.archive, false)))

    const coffeesWithRating: Coffees[] = coffees.map((coffee) => ({
      ...coffee,
      avgExperience: 0,
      avgTaste: 0,
      avgRating: 0
    }))

    await Promise.all(
      coffeesWithRating.map(async (element: Coffees) => {
        const coffeeRatings: CoffeeRating[] =
          await db.query.coffeeRating.findMany({
            where(fields, operators) {
              return operators.and(eq(fields.coffeeId, element.id))
            }
          })
        if (coffeeRatings.length === 0) return

        let experience = 0
        let taste = 0
        await Promise.all(
          coffeeRatings.map(async (rec) => {
            experience += rec.experience
            taste += rec.taste
          })
        )

        element.avgExperience = experience /= coffeeRatings.length
        element.avgTaste = taste /= coffeeRatings.length
        const avg = (element.avgExperience + element.avgTaste) / 2
        element.avgRating = Math.round(avg * 2) / 2
      })
    )
    return coffeesWithRating
  } catch (error: any) {
    log.error(`Failed to find coffees: ${error.message}`)
    throw new Error()
  }
}
export async function getCoffee(id: string) {
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

    const records = await db
      .select()
      .from(coffee)
      .where(eq(coffee.id, id))
      .limit(1)

    return records[0]
  } catch (error: any) {
    log.error(`Failed to find coffee: ${error.message}`)
    throw new Error()
  }
}
export async function getCoffeeRatings(id: string) {
  try {
    const authUser = await auth()

    if (!authUser.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const extenededCoffeeRating = await db
      .select()
      .from(coffeeRating)
      .innerJoin(user, eq(user.id, coffeeRating.userId))
      .where(eq(coffeeRating.coffeeId, id))

    const coffeeRatings: CoffeeRatings[] = extenededCoffeeRating.map(
      (coffeeRating) => {
        return {
          id: coffeeRating.coffeeRating.id,
          coffeeId: coffeeRating.coffeeRating.coffeeId,
          userId: coffeeRating.coffeeRating.userId,
          experience: coffeeRating.coffeeRating.experience,
          taste: coffeeRating.coffeeRating.taste,
          username: coffeeRating.user.name
        }
      }
    )

    return coffeeRatings
  } catch (error: any) {
    log.error(`Failed to find coffee ratings: ${error.message}`)
    throw new Error()
  }
}
export async function deleteCoffeeRating(rating: CoffeeRating) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    await db.delete(coffeeRating).where(eq(coffeeRating.id, rating.id))
  } catch (error: any) {
    log.error(`Failed to delete coffee ratings: ${error.message}`)
    throw new Error()
  }
}
export async function updateCoffeeRating(coffeeRatingData: CoffeeRating) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (coffeeRatingData.id === '') {
      coffeeRatingData.id = uuidv4().toString()
    }

    const records = await db
      .insert(coffeeRating)
      .values({
        id: coffeeRatingData.id,
        coffeeId: coffeeRatingData.coffeeId,
        userId: coffeeRatingData.userId,
        experience: coffeeRatingData.experience,
        taste: coffeeRatingData.taste
      })
      .onConflictDoUpdate({
        target: coffeeRating.id,
        set: {
          coffeeId: coffeeRatingData.coffeeId,
          userId: coffeeRatingData.userId,
          experience: coffeeRatingData.experience,
          taste: coffeeRatingData.taste
        }
      })
      .returning()

    return records[0]
  } catch (error: any) {
    log.error(`Failed to create/update coffee ratings: ${error.message}`)
    throw new Error()
  }
}
export async function updateCoffee(coffeeData: Coffee) {
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

    if (coffeeData.id === '') {
      coffeeData.id = uuidv4().toString()
    }

    const records = await db
      .insert(coffee)
      .values({
        id: coffeeData.id,
        name: coffeeData.name,
        archive: coffeeData.archive,
        addedById: userInfo.id,
        userGroupId: userGroup.id,
        address: coffeeData.address
      })
      .onConflictDoUpdate({
        target: coffee.id,
        set: {
          name: coffeeData.name,
          archive: coffeeData.archive,
          addedById: userInfo.id,
          userGroupId: userGroup.id,
          address: coffeeData.address
        }
      })
      .returning()

    return records[0]
  } catch (error: any) {
    log.error(`Failed to create/update coffee: ${error.message}`)
    throw new Error()
  }
}
export async function archiveCoffee(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db
      .update(coffee)
      .set({
        archive: true
      })
      .where(eq(coffee.id, id))
  } catch (error: any) {
    log.error(`Failed to archive coffee: ${error.message}`)
    throw new Error()
  }
}
