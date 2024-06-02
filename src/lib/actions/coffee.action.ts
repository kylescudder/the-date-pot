'use server'

import { db } from '@/server/db'
import {
  Coffee,
  CoffeeRating,
  User,
  coffee,
  coffeeRating
} from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { uuidv4 } from '../utils'

export async function getCoffeeList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const coffees: Coffee[] = await db.query.coffee.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })

    await Promise.all(
      coffees.map(async (element) => {
        const coffeeRatings: CoffeeRating[] =
          await db.query.coffeeRating.findMany({
            where(fields, operators) {
              return operators.and(eq(fields.coffeeId, element.id))
            }
          })

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
    return coffees
  } catch (error: any) {
    throw new Error(`Failed to find coffees: ${error.message}`)
  }
}
export async function getCoffee(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    return await db.query.coffee.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find coffee: ${error.message}`)
  }
}
export async function getCoffeeRatings(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const ratings: CoffeeRating[] = await db.query.coffeeRating.findMany({
      where(fields, operators) {
        return operators.and(eq(fields.coffeeId, id))
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
    throw new Error(`Failed to find coffee ratings: ${error.message}`)
  }
}
export async function deleteCoffeeRating(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.coffeeRating.findFirst({
      where(fields, operators) {
        return operators.and(eq(fields.id, id))
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find coffee ratings: ${error.message}`)
  }
}
export async function updateCoffeeRating(coffeeRatingData: CoffeeRating) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    if (coffeeRatingData.id === '') {
      coffeeRatingData.id = uuidv4().toString()
    }

    return await db
      .update(coffeeRating)
      .set({
        id: coffeeRatingData.id,
        coffeeId: coffeeRatingData.coffeeId,
        userId: coffeeRatingData.userId,
        experience: coffeeRatingData.experience,
        taste: coffeeRatingData.taste
      })
      .where(eq(coffeeRating.id, coffeeRatingData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update coffee ratings: ${error.message}`)
  }
}
export async function updateCoffee(coffeeData: Coffee) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    if (coffeeData.id === '') {
      coffeeData.id = uuidv4().toString()
    }

    return await db
      .update(coffee)
      .set({
        id: coffeeData.id,
        coffeeName: coffeeData.coffeeName,
        archive: coffeeData.archive,
        addedById: userInfo.id,
        userGroupId: userGroup.id,
        address: coffeeData.address
      })
      .where(eq(coffeeRating.id, coffeeData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update coffee: ${error.message}`)
  }
}
export async function archiveCoffee(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db
      .update(coffee)
      .set({
        archive: true
      })
      .where(eq(coffee.id, id))
  } catch (error: any) {
    throw new Error(`Failed to archive coffee: ${error.message}`)
  }
}
