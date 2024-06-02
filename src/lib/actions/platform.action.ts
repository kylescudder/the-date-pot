'use server'

import { db } from '@/server/db'
import { Platform, platform } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'

export async function getPlatformList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.platform.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find platforms: ${error.message}`)
  }
}

export async function addPlatform(platformData: Platform) {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    if (platformData.id === '') {
      platformData.id = uuidv4().toString()
    }

    await db
      .update(platform)
      .set({
        id: platformData.id,
        platformName: platformData.platformName
      })
      .where(eq(platform.id, platformData.id))
  } catch (error: any) {
    throw new Error(`Failed to add platform: ${error.message}`)
  }
}
