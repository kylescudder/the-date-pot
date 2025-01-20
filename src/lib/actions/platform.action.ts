'use server'

import { db } from '@/server/db'
import { Platform, platform } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getPlatformList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.platform.findMany({})
  } catch (error: any) {
    log.error(`Failed to find platforms: ${error.message}`)
    throw new Error()
  }
}

export async function addPlatform(platformData: Platform) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

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
    log.error(`Failed to add platform: ${error.message}`)
    throw new Error()
  }
}
