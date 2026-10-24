'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { sql } from 'drizzle-orm/sql/sql'
import { group, user, userGroups } from '@/server/db/schema'
import { Users } from '../models/users'
import { log } from '@logtail/next'

export async function getUserInfo(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.user.findFirst({
      where(fields, operators) {
        return operators.and(eq(fields.clerkId, id))
      }
    })
  } catch (error: any) {
    log.error(`Failed to get user info: ${error.message}`)
    throw new Error()
  }
}
export async function getUserGroup(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userGroupRecords = await db
      .select()
      .from(group)
      .innerJoin(userGroups, eq(group.id, userGroups.groupId))
      .where(sql`${userGroups.userId} = ${id}`)

    return userGroupRecords[0].group
  } catch (error: any) {
    log.error(`Failed to get user groups: ${error.message}`)
    throw new Error()
  }
}
export async function getGroupUsers() {
  try {
    const authUser = await auth()

    if (!authUser.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    const userInfo = await getUserInfo(authUser?.userId ?? '')
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
      .from(user)
      .innerJoin(userGroups, eq(user.id, userGroups.userId))
      .where(sql`${userGroups.groupId} = ${userGroup.id}`)

    let users: Users[] = []
    records.forEach(async (user) => {
      const userRecord = {
        ...user.user,
        image: ''
      }
      users.push(userRecord)
    })

    return users
  } catch (error: any) {
    log.error(`Failed to create/update user: ${error.message}`)
    throw new Error()
  }
}
