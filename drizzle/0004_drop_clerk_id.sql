-- Drops the legacy Clerk identity. Better Auth (user.auth_user_id) is the only
-- link from accounts to members, and nothing reads or writes this column.
-- Deliberately not additive: images before #951 still select it.

ALTER TABLE "user" DROP COLUMN "clerkId";
