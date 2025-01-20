'use server'

import { db } from '@/server/db'
import { When, when } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { log } from '@logtail/next'

export async function getWhenList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.when.findMany({})
  } catch (error: any) {
    log.error(`Failed to find whens: ${error.message}`)
    throw new Error()
  }
}

export async function addWhen(whenData: When) {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    if (whenData.id === '') {
      whenData.id = uuidv4().toString()
    }

    await db
      .update(when)
      .set({
        id: whenData.id,
        when: whenData.when
      })
      .where(eq(when.id, whenData.id))
  } catch (error: any) {
    log.error(`Failed to add when: ${error.message}`)
    throw new Error()
  }
}
