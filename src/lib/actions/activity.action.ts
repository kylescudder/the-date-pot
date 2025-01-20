'use server'

import { auth } from '@clerk/nextjs/server'
import { getUserGroup, getUserInfo } from './user.actions'
import { db } from '@/server/db'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { Activity, activity } from '@/server/db/schema'
import { uuidv4 } from '../utils'
import { log } from '@logtail/next'

export async function getActivityList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.activity.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })
  } catch (error: any) {
    log.error(`Failed to find activities: ${error.message}`)
    throw new Error()
  }
}

export async function getActivity(id: string) {
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

    const activities = await db
      .select()
      .from(activity)
      .where(eq(activity.id, id))
      .limit(1)

    return activities[0]
  } catch (error: any) {
    log.error(`Failed to find activity: ${error.message}`)
    throw new Error()
  }
}
export async function updateActivity(ActivityData: Activity) {
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

    if (ActivityData.id === '') {
      ActivityData.id = uuidv4().toString()
    }

    return await db
      .insert(activity)
      .values({
        id: ActivityData.id,
        name: ActivityData.name,
        address: ActivityData.address,
        archive: ActivityData.archive,
        userGroupId: userGroup.id,
        expenseId: ActivityData.expenseId
      })
      .onConflictDoUpdate({
        target: activity.id,
        set: {
          name: ActivityData.name,
          address: ActivityData.address,
          archive: ActivityData.archive,
          userGroupId: userGroup.id,
          expenseId: ActivityData.expenseId
        }
      })
      .returning()
  } catch (error: any) {
    log.error(`Failed to create/update activity: ${error.message}`)
    throw new Error()
  }
}
export async function archiveActivity(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    await db
      .update(activity)
      .set({
        archive: true
      })
      .where(eq(activity.id, id))
  } catch (error: any) {
    log.error(`Failed to archive activity: ${error.message}`)
    throw new Error()
  }
}
