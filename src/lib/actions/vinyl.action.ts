'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getUserGroup, getUserInfo } from './user.actions'
import { Vinyl, vinyl } from '@/server/db/schema'
import { uuidv4 } from '../utils'
import { log } from '@logtail/next'

export async function getVinylList(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.vinyl.findMany({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, id),
          eq(fields.archive, false)
        )
      }
    })
  } catch (error: any) {
    log.error(`Failed to find vinyls: ${error.message}`)
    throw new Error()
  }
}
export async function getVinyl(id: string) {
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

    return await db.query.vinyl.findFirst({
      where(fields, operators) {
        return operators.and(
          eq(fields.userGroupId, userGroup.id),
          eq(fields.id, id)
        )
      }
    })
  } catch (error: any) {
    log.error(`Failed to find vinyl: ${error.message}`)
    throw new Error()
  }
}
export async function updateVinyl(vinylData: Vinyl) {
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

    if (vinylData.id === '') {
      vinylData.id = uuidv4().toString()
    }

    return await db
      .insert(vinyl)
      .values({
        id: vinylData.id,
        name: vinylData.name,
        artist: vinylData.artist,
        purchased: vinylData.purchased,
        archive: vinylData.archive,
        addedById: userInfo.id,
        userGroupId: userGroup.id
      })
      .onConflictDoUpdate({
        target: vinyl.id,
        set: {
          name: vinylData.name,
          artist: vinylData.artist,
          purchased: vinylData.purchased,
          archive: vinylData.archive,
          addedById: userInfo.id,
          userGroupId: userGroup.id
        }
      })
      .returning()
  } catch (error: any) {
    log.error(`Failed to create/update vinyl: ${error.message}`)
    throw new Error()
  }
}
export async function archiveVinyl(id: string) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db
      .update(vinyl)
      .set({
        archive: true
      })
      .where(eq(vinyl.id, id))
  } catch (error: any) {
    log.error(`Failed to archive vinyl: ${error.message}`)
    throw new Error()
  }
}
