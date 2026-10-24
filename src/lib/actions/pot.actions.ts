'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { log } from '@logtail/next'

export async function getPots() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.pot.findMany({})
  } catch (error: any) {
    log.error(`Failed to get pots: ${error.message}`)
    throw new Error()
  }
}
