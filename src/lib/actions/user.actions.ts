'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm/sql/sql'
import { group, user, userGroups, type User } from '@/server/db/schema'
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
export async function updateUser(userData: User, path: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    await db
      .update(user)
      .set({
        username: userData.username,
        clerkId: userData.clerkId,
        name: userData.name,
        bio: userData.bio,
        onboarded: true
      })
      .where(eq(user.clerkId, userData.clerkId))

    if (path === '/profile/edit') {
      revalidatePath(path)
    }
  } catch (error: any) {
    log.error(`Failed to create/update user: ${error.message}`)
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
      .from(user)
      .innerJoin(userGroups, eq(user.id, userGroups.userId))
      .where(sql`${userGroups.groupId} = ${groupUsers.id}`)

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
