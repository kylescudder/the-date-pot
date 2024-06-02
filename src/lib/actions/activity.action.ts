'use server'

import { auth } from '@clerk/nextjs/server'
import { getUserGroup, getUserInfo } from './user.actions'
import { db } from '@/server/db'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { Activity, activity } from '@/server/db/schema'
import { uuidv4 } from '../utils'

export async function getActivityList(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.activity.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find activities: ${error.message}`)
  }
}

export async function getActivity(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    return await db.query.activity.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to find activity: ${error.message}`)
  }
}
export async function updateActivity(ActivityData: Activity) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(user?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const userGroup = await getUserGroup(userInfo.id)
    if (!userGroup) throw new Error('User group info not found')

    if (ActivityData.id === '') {
      ActivityData.id = uuidv4().toString()
    }

    await db
      .update(activity)
      .set({
        id: ActivityData.id,
        activityName: ActivityData.activityName,
        address: ActivityData.address,
        archive: ActivityData.archive,
        userGroupId: userGroup.id,
        expenseId: ActivityData.expenseId
      })
      .where(eq(activity.id, ActivityData.id))
  } catch (error: any) {
    throw new Error(`Failed to create/update activity: ${error.message}`)
  }
}
export async function archiveActivity(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    await db
      .update(activity)
      .set({
        archive: true
      })
      .where(eq(activity.id, id))
  } catch (error: any) {
    throw new Error(`Failed to archive activity: ${error.message}`)
  }
}
