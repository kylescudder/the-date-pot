import { customType, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { authUser } from './auth-schema'

const binary = customType<{ data: Buffer }>({ dataType: () => 'bytea' })

// A small, re-encoded profile photo per Better Auth account. It lives in the
// app's own database, so encrypted project backups cover it.
export const userProfile = pgTable('user_profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  avatar: binary('avatar'),
  avatarVersion: text('avatar_version'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})
