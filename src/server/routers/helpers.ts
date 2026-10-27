import { eq } from 'drizzle-orm'
import type { Orm } from '../db'
import { userGroups } from '../db/schema'

// Overall stars: the mean of the two criteria, to the nearest half star.
export function averageRating(first: number, second: number) {
  return Math.round(((first + second) / 2) * 2) / 2
}

export async function groupMemberIds(db: Orm, groupId: string) {
  const rows = await db
    .select({ userId: userGroups.userId })
    .from(userGroups)
    .where(eq(userGroups.groupId, groupId))
  return rows.map((row) => row.userId)
}
