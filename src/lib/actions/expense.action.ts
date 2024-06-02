'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'

export async function getExpenseList() {
  try {
    const user = auth()

    if (!user.userId) throw new Error('Unauthorized')

    return await db.query.expense.findMany({})
  } catch (error: any) {
    throw new Error(`Failed to find expenses: ${error.message}`)
  }
}
