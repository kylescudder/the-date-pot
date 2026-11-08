import { eq } from 'drizzle-orm'
import type { Orm } from './db'
import { group, user, userGroups } from './db/schema'
import { isVerifiedMember } from './auth-policy'

export type AuthIdentity = { id: string; email: string; name: string }

// Mirrors the original onboarding defaults: the username is the account's
// email address and the name is the profile's name (falling back to the
// email's local part, since email-code accounts start without one).
export function appUserDefaults(identity: AuthIdentity) {
  const email = identity.email.trim().toLowerCase()
  const name = identity.name.trim() || email.split('@')[0] || email
  return { name: name.slice(0, 120), username: email, bio: '' }
}

// Returns the app user linked to a verified Better Auth account through
// `auth_user_id`. Anyone without one gets a new row and, like the original
// onboarding, a pot (group) of their own.
export async function resolveAppUser(db: Orm, identity: AuthIdentity) {
  const [linked] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.authUserId, identity.id))
    .limit(1)
  if (linked) return linked.id
  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(user)
      .values({ ...appUserDefaults(identity), authUserId: identity.id })
      // A concurrent first request may have created it; the unique link wins.
      .onConflictDoNothing({ target: user.authUserId })
      .returning({ id: user.id })
    if (!created) {
      const [existing] = await transaction
        .select({ id: user.id })
        .from(user)
        .where(eq(user.authUserId, identity.id))
      return existing!.id
    }
    const [pot] = await transaction
      .insert(group)
      .values({})
      .returning({ id: group.id })
    await transaction
      .insert(userGroups)
      .values({ userId: created.id, groupId: pot!.id })
    return created.id
  })
}

// Keeps the name other group members see in step with the profile.
export async function syncAppUserName(
  db: Orm,
  authUserId: string,
  name: string
) {
  const trimmed = name.trim().slice(0, 120)
  if (!trimmed) return
  await db
    .update(user)
    .set({ name: trimmed })
    .where(eq(user.authUserId, authUserId))
}

// tRPC identity: a verified, still-permitted session resolves
// to the linked (or newly provisioned) app user's id on every request.
export function betterAuthIdentity(
  db: Orm,
  auth: {
    api: {
      getSession: (input: { headers: Headers }) => Promise<{
        user: AuthIdentity & { emailVerified: boolean }
      } | null>
    }
  },
  allowedEmails: readonly string[]
) {
  return async (request: Request) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !isVerifiedMember(session.user, allowedEmails)) return null
    return resolveAppUser(db, session.user)
  }
}
