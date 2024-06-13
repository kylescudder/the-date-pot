'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm/sql/sql'
import { group, user, userGroups, type User } from '@/server/db/schema'

export async function getUserInfo(id: string) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.user.findFirst({
      where(fields, operators) {
        return operators.and(eq(fields.clerkId, id))
      }
    })
  } catch (error: any) {
    throw new Error(`Failed to get user info: ${error.message}`)
  }
}
export async function updateUser(userData: User, path: string) {
  try {
    const users = auth()

    if (!users.userId) throw new Error('Unauthorized')

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
    throw new Error(`Failed to create/update user: ${error.message}`)
  }
}
export async function getUserGroup(id: string) {
  try {
    const userAuth = auth()

    if (!userAuth.userId) throw new Error('Unauthorized')

    const userGroupRecords = await db
      .select()
      .from(group)
      .innerJoin(userGroups, eq(group.id, userGroups.groupId))
      .where(sql`${userGroups.userId} = ${id}`)

    return userGroupRecords[0].group
  } catch (error: any) {
    throw new Error(`Failed to get user groups: ${error.message}`)
  }
}
export async function getGroupUsers() {
  try {
    const userAuth = auth()

    if (!userAuth.userId) throw new Error('Unauthorized')

    const userInfo = await getUserInfo(userAuth?.userId ?? '')
    if (!userInfo) throw new Error('User info not found')
    const groupUsers = await getUserGroup(userInfo.id)
    if (!groupUsers) throw new Error('User group info not found')

    const users = []

    const records = await db
      .select()
      .from(user)
      .innerJoin(userGroups, eq(user.id, userGroups.userId))
      .where(sql`${userGroups.groupId} = ${groupUsers.id}`)

    records.forEach(async (user) => {
      users.push(user.user)
    })

    return users
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`)
  }
}
