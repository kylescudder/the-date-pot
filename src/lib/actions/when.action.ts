'use server'

import { db } from '@/server/db'
import { When, when } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { uuidv4 } from '../utils'
import { eq } from 'drizzle-orm/sql/expressions/conditions'

export async function getWhenList() {
  try {
    const user = await auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.when.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find whens: ${error.message}`)
  }
}

export async function addWhen(whenData: When) {
  try {
    const user = await auth()

    if (!user.userId) throw new Error('Unauthorized')

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
    throw new Error(`Failed to add when: ${error.message}`)
  }
}
