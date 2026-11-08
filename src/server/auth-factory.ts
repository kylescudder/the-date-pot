import { createHmac } from 'node:crypto'
import { betterAuth } from 'better-auth'
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx
} from 'better-auth/api'
import { emailOTP, magicLink } from 'better-auth/plugins'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { passkey } from '@better-auth/passkey'
import { z } from 'zod'
import type { Orm } from './db'
import * as schema from './db/auth-schema'
import { reserveEmailDelivery, type LinkEmailKind } from './auth-email'
import { isAllowedEmail, isVerifiedMember } from './auth-policy'
import { syncAppUserName } from './app-user'
import { currentAvatarUrl } from './profile-photo'

const hasUnsafeCharacters = (value: string) =>
  [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code < 0x20 || code === 0x7f || character === '\\'
  })

// Relative paths, or absolute URLs on this origin, only. Resolve against the
// origin rather than inspecting the string: URL parsing strips tabs/newlines
// and treats backslashes as slashes, so `/\t/evil.example` would escape a
// prefix check. Control characters and backslashes are refused outright.
export function isSameSiteTarget(target: unknown, origin: string) {
  if (typeof target !== 'string' || hasUnsafeCharacters(target)) return false
  if (!URL.canParse(target, origin)) return false
  const url = new URL(target, origin)
  // Also refuse paths that normalise to `//host` (e.g. `/.//evil.example/`).
  return url.origin === origin && !url.pathname.startsWith('//')
}

const names = {
  name: z.string().trim().min(1).max(120),
  givenName: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .transform((value) => value ?? ''),
  familyName: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .transform((value) => value ?? '')
}

// Profile edits may change names, never email or verification. An image is
// accepted only as confirmation of the photo /api/profile/avatar stored.
const profileUpdateSchema = z
  .strictObject({
    name: names.name.optional(),
    givenName: names.givenName.optional(),
    familyName: names.familyName.optional(),
    image: z.string().max(200).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0)

const signUpSchema = z.strictObject({
  name: names.name,
  email: z.string(),
  password: z.string(),
  givenName: names.givenName.optional(),
  familyName: names.familyName.optional(),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional()
})

export type AuthSettings = {
  baseURL: string
  secret: string
  // Empty means open sign-up.
  allowedEmails: readonly string[]
  dailyEmailLimit: number
}

type SessionUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string
}

export type DatePotAuth = {
  handler: (request: Request) => Promise<Response>
  api: {
    getSession: (input: {
      headers: Headers
    }) => Promise<{ user: SessionUser } | null>
  }
}

export function createDatePotAuth(
  database: Orm,
  settings: AuthSettings,
  sendOTP: (email: string, otp: string) => Promise<void>,
  sendLink: (
    email: string,
    kind: LinkEmailKind,
    url: string
  ) => Promise<void> = async () => {
    throw new APIError('SERVICE_UNAVAILABLE', {
      message: 'The sign-in email could not be sent. Please try again later.'
    })
  }
): DatePotAuth {
  const origin = new URL(settings.baseURL).origin
  const allowed = (email: string) =>
    isAllowedEmail(email, settings.allowedEmails)
  const openSignUp = settings.allowedEmails.length === 0
  const publicPasskeyPaths = new Set([
    '/passkey/generate-authenticate-options',
    '/passkey/verify-authentication'
  ])
  const refuseCrossSite = (headers: Headers | undefined, strict = false) => {
    const requestOrigin = headers?.get('origin')
    if (
      (strict
        ? requestOrigin !== origin
        : requestOrigin && requestOrigin !== origin) ||
      headers?.get('sec-fetch-site') === 'cross-site'
    )
      throw new APIError('FORBIDDEN', { message: 'Cross-site request refused' })
  }
  const refuseOffSiteRedirects = (
    body: Record<string, unknown> | undefined
  ) => {
    // Emailed links may only return to this site.
    for (const key of [
      'callbackURL',
      'newUserCallbackURL',
      'errorCallbackURL',
      'redirectTo'
    ]) {
      const target: unknown = body?.[key]
      if (target !== undefined && !isSameSiteTarget(target, origin))
        throw new APIError('FORBIDDEN', { message: 'Invalid redirect' })
    }
  }
  const normalisedEmail = (body: Record<string, unknown> | undefined) =>
    typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  const instance = betterAuth({
    appName: 'The Date Pot',
    baseURL: origin,
    basePath: '/api/auth',
    secret: settings.secret,
    trustedOrigins: [origin],
    database: drizzleAdapter(database, {
      provider: 'pg',
      transaction: true,
      schema: {
        user: schema.authUser,
        session: schema.authSession,
        account: schema.authAccount,
        verification: schema.authVerification,
        passkey: schema.authPasskey,
        rateLimit: schema.authRateLimit
      }
    }),
    session: {
      expiresIn: 7 * 86400,
      updateAge: 86400,
      freshAge: 3600,
      cookieCache: { enabled: false }
    },
    emailAndPassword: {
      enabled: true,
      // The Date Pot has open sign-up. Setting AUTH_ALLOWED_EMAILS closes it
      // again: accounts then start with an email code or magic link.
      disableSignUp: !openSignUp,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 1800,
      revokeSessionsOnPasswordReset: true,
      async sendResetPassword({ user, url }) {
        if (!allowed(user.email)) return
        // Reserved here, not in the request hook: requests for addresses with
        // no account send nothing and must not spend the shared budget.
        await reserveEmailDelivery(
          database,
          user.email,
          settings.dailyEmailLimit
        )
        await sendLink(user.email, 'reset-password', url)
      }
    },
    emailVerification: {
      // Password sign-ups prove the address before they can sign in.
      sendOnSignUp: true,
      sendOnSignIn: false,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
      async sendVerificationEmail({ user, url }) {
        if (!allowed(user.email)) return
        // Duplicate sign-ups and already-verified addresses send nothing, so
        // only an actual confirmation email spends the shared budget.
        await reserveEmailDelivery(
          database,
          user.email,
          settings.dailyEmailLimit
        )
        await sendLink(user.email, 'verify-email', url)
      }
    },
    user: {
      changeEmail: { enabled: false },
      additionalFields: {
        givenName: { type: 'string', required: false, defaultValue: '' },
        familyName: { type: 'string', required: false, defaultValue: '' }
      }
    },
    advanced: {
      cookiePrefix: 'datepot-auth',
      useSecureCookies: origin.startsWith('https://'),
      crossSubDomainCookies: { enabled: false },
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', path: '/' },
      // The origin has no public port; only Cloudflare's tunnel reaches Caddy.
      // Cloudflare replaces this header instead of trusting a client-sent value.
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] }
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 60,
      customRules: {
        '/email-otp/send-verification-otp': { window: 60, max: 3 },
        '/sign-in/email-otp': { window: 60, max: 10 },
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
        '/sign-in/magic-link': { window: 60, max: 3 },
        '/magic-link/verify': { window: 60, max: 10 },
        '/request-password-reset': { window: 60, max: 3 },
        '/reset-password': { window: 60, max: 5 },
        '/change-password': { window: 60, max: 5 },
        '/verify-email': { window: 60, max: 10 },
        '/send-verification-email': { window: 60, max: 3 },
        '/passkey/*': { window: 60, max: 20 }
      }
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Emailed links carry their redirects in the query string; a tampered
        // link must not send anyone off-site after verifying.
        if (ctx.path === '/magic-link/verify' || ctx.path === '/verify-email')
          refuseOffSiteRedirects(ctx.query)
        if (ctx.path === '/update-user') {
          refuseCrossSite(ctx.headers, true)
          const session = await getSessionFromCtx(ctx)
          if (!isVerifiedMember(session?.user, settings.allowedEmails))
            throw new APIError('UNAUTHORIZED', {
              message: 'Sign in with a verified email first'
            })
          const parsed = profileUpdateSchema.safeParse(ctx.body)
          if (!parsed.success)
            throw new APIError('BAD_REQUEST', {
              message: 'Invalid profile update'
            })
          if (
            parsed.data.image !== undefined &&
            parsed.data.image !==
              (await currentAvatarUrl(database, session!.user.id))
          )
            throw new APIError('BAD_REQUEST', {
              message: 'Upload or remove your profile photo first'
            })
          Object.assign(ctx.body, parsed.data)
        }
        if (ctx.path === '/sign-up/email') {
          refuseCrossSite(ctx.headers)
          refuseOffSiteRedirects(ctx.body)
          const parsed = signUpSchema.safeParse(ctx.body)
          if (!parsed.success)
            throw new APIError('BAD_REQUEST', {
              message: 'Invalid sign-up'
            })
          const email = normalisedEmail(ctx.body)
          if (!openSignUp || !allowed(email))
            throw new APIError('BAD_REQUEST', {
              message: 'Email and password sign up is not enabled'
            })
          // The confirmation email reserves its delivery when it is sent.
          Object.assign(ctx.body, parsed.data, { email })
        }
        // Accounts created by code or link take no client-chosen image URL.
        if (
          (ctx.path === '/sign-in/email-otp' ||
            ctx.path === '/sign-in/magic-link') &&
          ctx.body &&
          typeof ctx.body === 'object'
        )
          delete ctx.body.image
        if (ctx.path === '/email-otp/send-verification-otp') {
          refuseCrossSite(ctx.headers)
          const email = normalisedEmail(ctx.body)
          if (ctx.body?.type !== 'sign-in')
            throw new APIError('BAD_REQUEST', {
              message: 'Unsupported sign-in method'
            })
          if (!allowed(email)) return ctx.json({ success: true })
          ctx.body.email = email
          await reserveEmailDelivery(database, email, settings.dailyEmailLimit)
        }
        if (
          ctx.path === '/sign-in/magic-link' ||
          ctx.path === '/request-password-reset' ||
          ctx.path === '/send-verification-email'
        ) {
          refuseCrossSite(ctx.headers)
          refuseOffSiteRedirects(ctx.body)
          const email = normalisedEmail(ctx.body)
          // Same generic answer for every address, so the form never reveals
          // who is allowed. Only permitted addresses reach the mailer.
          if (!allowed(email)) return ctx.json({ status: true })
          ctx.body.email = email
          // Magic links go to any permitted address (they can create the
          // account), so reserve now. Reset and verification emails reserve
          // in their send callbacks, only when an email will really be sent.
          if (ctx.path === '/sign-in/magic-link')
            await reserveEmailDelivery(
              database,
              email,
              settings.dailyEmailLimit
            )
        }
        if (
          ctx.path.startsWith('/passkey/') &&
          !publicPasskeyPaths.has(ctx.path)
        ) {
          const session = await getSessionFromCtx(ctx)
          if (!isVerifiedMember(session?.user, settings.allowedEmails))
            throw new APIError('UNAUTHORIZED', {
              message: 'Sign in with a verified email first'
            })
        }
      })
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!allowed(user.email))
              throw new APIError('FORBIDDEN', {
                message: 'This email cannot create an account'
              })
            return { data: { ...user, email: user.email.trim().toLowerCase() } }
          }
        },
        update: {
          after: async (user, context) => {
            if (
              context?.path === '/update-user' &&
              typeof user.name === 'string'
            )
              await syncAppUserName(database, user.id, user.name)
          }
        }
      }
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        allowedAttempts: 5,
        storeOTP: {
          hash: async (otp) =>
            createHmac('sha256', settings.secret)
              .update('datepot-email-otp:' + otp)
              .digest('hex')
        },
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== 'sign-in' || !allowed(email))
            throw new APIError('FORBIDDEN', {
              message: 'Unsupported sign-in request'
            })
          await sendOTP(email, otp)
        }
      }),
      magicLink({
        expiresIn: 600,
        storeToken: 'hashed',
        async sendMagicLink({ email, url }) {
          if (!allowed(email))
            throw new APIError('FORBIDDEN', {
              message: 'Unsupported sign-in request'
            })
          await sendLink(email, 'magic-link', url)
        }
      }),
      passkey({
        rpID: new URL(origin).hostname,
        rpName: 'The Date Pot',
        origin,
        registration: { requireSession: true },
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required'
        }
      })
    ]
  })
  // Keep the rest of the server dependent on the two operations it uses,
  // rather than exporting every plugin's generic endpoint types.
  return {
    handler: instance.handler,
    api: {
      getSession: async (input) => {
        const session = await instance.api.getSession(input)
        return session ? { user: session.user } : null
      }
    }
  }
}
