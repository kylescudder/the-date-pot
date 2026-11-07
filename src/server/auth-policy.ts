// The Date Pot has open sign-up: an empty allowlist lets anyone create an
// account. A configured AUTH_ALLOWED_EMAILS restricts accounts and mail to it.
export function isAllowedEmail(
  email: string,
  allowedEmails: readonly string[]
) {
  return (
    allowedEmails.length === 0 ||
    allowedEmails.includes(email.trim().toLowerCase())
  )
}

// Server-side authorization needs a verified email that is still permitted, so
// removing an address from a configured allowlist revokes access.
export function isVerifiedMember(
  user: { email: string; emailVerified: boolean } | null | undefined,
  allowedEmails: readonly string[]
) {
  return !!user?.emailVerified && isAllowedEmail(user.email, allowedEmails)
}
