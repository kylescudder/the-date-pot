import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import sharp from 'sharp'
import type { Orm } from './db'
import { authUser } from './db/auth-schema'
import { userProfile } from './db/profile-schema'
import { isVerifiedMember } from './auth-policy'
import { avatarPath, avatarUrl } from './profile-photo'

// The app container has 256 MB: decode one small image at a time, uncached.
sharp.cache(false)
sharp.concurrency(1)

type Identity = { id: string; email: string; emailVerified: boolean }
type Settings = {
  origin: string
  // Empty means open sign-up: any verified account may manage its own photo.
  allowedEmails: readonly string[]
  getSession: (headers: Headers) => Promise<{ user: Identity } | null>
}

const uploadLimit = 2 * 1024 * 1024

const privateHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

class ProfileError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get('content-length')) > limit)
    throw new ProfileError(413, 'This upload is too large.')
  const reader = request.body?.getReader()
  if (!reader) throw new ProfileError(400, 'Request body is required.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new ProfileError(413, 'This upload is too large.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks)
}

// Identify the format from its signature before any decoder sees the bytes.
function sniffFormat(body: Buffer) {
  if (body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpeg'
  if (body.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    return 'png'
  if (
    body.subarray(0, 4).toString('ascii') === 'RIFF' &&
    body.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'webp'
  return null
}

// Validates, crops to 256 px and re-encodes as JPEG, which drops EXIF and any
// other metadata and never serves uploaded active content.
export async function processAvatar(body: Buffer) {
  const format = sniffFormat(body)
  if (!format)
    throw new ProfileError(400, 'Choose a valid JPEG, PNG or WebP photo.')
  try {
    const image = sharp(body, {
      failOn: 'error',
      limitInputPixels: 4_000_000,
      animated: false
    })
    const metadata = await image.metadata()
    if (metadata.format !== format || (metadata.pages ?? 1) > 1)
      throw new Error('Unsupported image')
    return await image
      .rotate()
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch {
    throw new ProfileError(
      400,
      'This photo could not be read. Choose a different JPEG, PNG or WebP image.'
    )
  }
}

// GET, PUT and DELETE on /api/profile/avatar: a verified, still-permitted
// member reads and changes only their own photo.
export function createProfileHandler(database: Orm, settings: Settings) {
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: privateHeaders })
  return async (request: Request) => {
    try {
      if (new URL(request.url).pathname !== avatarPath)
        return json({ error: 'Not found' }, 404)
      if (!['GET', 'PUT', 'DELETE'].includes(request.method))
        return json({ error: 'Method not allowed' }, 405)
      if (
        request.method !== 'GET' &&
        (request.headers.get('origin') !== settings.origin ||
          request.headers.get('sec-fetch-site') === 'cross-site')
      )
        return json({ error: 'Cross-site request refused' }, 403)
      const session = await settings.getSession(request.headers)
      if (!session)
        return json({ error: 'Please sign in to manage your profile.' }, 401)
      if (!isVerifiedMember(session.user, settings.allowedEmails))
        return json({ error: 'Sign in with a verified email first.' }, 403)
      const userId = session.user.id
      if (request.method === 'GET') {
        const [row] = await database
          .select({ avatar: userProfile.avatar })
          .from(userProfile)
          .where(eq(userProfile.userId, userId))
        if (!row?.avatar) return json({ error: 'No profile photo' }, 404)
        return new Response(new Uint8Array(row.avatar), {
          headers: {
            ...privateHeaders,
            'Content-Type': 'image/jpeg',
            'Content-Security-Policy': "default-src 'none'; sandbox"
          }
        })
      }
      if (request.method === 'PUT') {
        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(
            request.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
          )
        )
          throw new ProfileError(415, 'Choose a JPEG, PNG or WebP photo.')
        const avatar = await processAvatar(await readBody(request, uploadLimit))
        // A new version on every update, so no client shows a stale photo.
        const avatarVersion = randomUUID()
        const image = avatarUrl(avatarVersion)
        await database.transaction(async (tx) => {
          await tx
            .insert(userProfile)
            .values({ userId, avatar, avatarVersion })
            .onConflictDoUpdate({
              target: userProfile.userId,
              set: { avatar, avatarVersion, updatedAt: new Date() }
            })
          await tx
            .update(authUser)
            .set({ image, updatedAt: new Date() })
            .where(eq(authUser.id, userId))
        })
        return json({ image })
      }
      await database.transaction(async (tx) => {
        await tx
          .update(userProfile)
          .set({ avatar: null, avatarVersion: null, updatedAt: new Date() })
          .where(eq(userProfile.userId, userId))
        await tx
          .update(authUser)
          .set({ image: null, updatedAt: new Date() })
          .where(eq(authUser.id, userId))
      })
      return json({ image: null })
    } catch (error) {
      if (error instanceof ProfileError)
        return json({ error: error.message }, error.status)
      // Never expose database or authentication details in errors.
      return json(
        { error: 'Unable to update your profile photo. Please try again.' },
        500
      )
    }
  }
}
