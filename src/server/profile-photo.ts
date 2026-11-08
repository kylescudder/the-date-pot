import { eq } from 'drizzle-orm'
import type { Orm } from './db'
import { userProfile } from './db/profile-schema'

export const avatarPath = '/api/profile/avatar'
// The version changes on every upload, so the URL never serves a stale photo.
export const avatarUrl = (version: string) => avatarPath + '?v=' + version

// The image value update-user may confirm: the stored photo's URL, or none.
export async function currentAvatarUrl(database: Orm, userId: string) {
  const [row] = await database
    .select({ version: userProfile.avatarVersion })
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
  return row?.version ? avatarUrl(row.version) : null
}
