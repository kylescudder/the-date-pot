const storageKey = 'datepot.pending-email-sign-in.v1'
export const emailCodeLifetime = 10 * 60 * 1000

export type PendingSignIn = { email: string; sentAt: number }

// Tab-scoped UI progress only: never persist an OTP, session or auth decision.
export function readPendingSignIn(now = Date.now()): PendingSignIn | null {
  try {
    const stored: unknown = JSON.parse(
      window.sessionStorage.getItem(storageKey) ?? 'null'
    )
    if (
      stored &&
      typeof stored === 'object' &&
      'email' in stored &&
      typeof stored.email === 'string' &&
      stored.email.length <= 254 &&
      stored.email.includes('@') &&
      'sentAt' in stored &&
      typeof stored.sentAt === 'number' &&
      Number.isFinite(stored.sentAt) &&
      stored.sentAt <= now &&
      now - stored.sentAt < emailCodeLifetime
    )
      return { email: stored.email, sentAt: stored.sentAt }
    clearPendingSignIn()
  } catch {
    // Storage can be blocked or unavailable during server rendering.
    clearPendingSignIn()
  }
  return null
}

export function savePendingSignIn(pending: PendingSignIn) {
  try {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ email: pending.email, sentAt: pending.sentAt })
    )
  } catch {
    // The mounted form must remain usable even when storage is unavailable.
  }
}

export function clearPendingSignIn() {
  try {
    window.sessionStorage.removeItem(storageKey)
  } catch {
    // Storage is an optional recovery aid, not an authentication dependency.
  }
}
