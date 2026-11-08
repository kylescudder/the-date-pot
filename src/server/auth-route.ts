// The only Better Auth endpoints the app exposes. Everything else is a 404.
export const authPaths = new Set([
  '/get-session',
  '/sign-out',
  '/update-user',
  '/email-otp/send-verification-otp',
  '/sign-in/email-otp',
  '/sign-in/email',
  // Sign-up is open unless AUTH_ALLOWED_EMAILS is set, when Better Auth refuses
  // other addresses. Password sign-ups confirm their address through the
  // emailed /verify-email link.
  '/sign-up/email',
  '/verify-email',
  '/send-verification-email',
  '/sign-in/magic-link',
  '/magic-link/verify',
  '/request-password-reset',
  '/reset-password',
  '/change-password',
  '/list-accounts',
  '/passkey/generate-register-options',
  '/passkey/verify-registration',
  '/passkey/generate-authenticate-options',
  '/passkey/verify-authentication',
  '/passkey/list-user-passkeys',
  '/passkey/update-passkey',
  '/passkey/delete-passkey'
])

export function isAuthPath(path: string) {
  // The emailed reset link lands on /reset-password/<token> before redirecting.
  return authPaths.has(path) || /^\/reset-password\/[\w-]+$/.test(path)
}

export function createAuthRouteHandler(
  auth: () => { handler: (request: Request) => Promise<Response> }
) {
  return async (request: Request) => {
    const path = new URL(request.url).pathname.slice('/api/auth'.length)
    if (!isAuthPath(path)) return new Response('Not found', { status: 404 })
    return auth().handler(request)
  }
}
