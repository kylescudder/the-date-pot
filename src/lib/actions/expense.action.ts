'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { log } from '@logtail/next'

export async function getExpenseList() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.expense.findMany({})
  } catch (error: any) {
    log.error(`Failed to find expenses: ${error.message}`)
    throw new Error()
  }
}
