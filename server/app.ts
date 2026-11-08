import { resolve } from 'node:path'

type Handler = (request: Request) => Response | Promise<Response>

// Bun's own body cap fits a profile photo (the photo handler enforces its
// 2 MB limit while streaming); every other route keeps the 64 KB limit.
export const requestBodyLimit = 65536
export const serverBodyLimit = 2 * 1024 * 1024 + requestBodyLimit

// Health, static assets and response headers around the TanStack Start app.
export function createApp({
  app,
  checkHealth,
  origin,
  revision,
  clientDirectory = resolve('dist/client')
}: {
  app: Handler
  checkHealth: () => Promise<void>
  origin: string
  revision: string
  clientDirectory?: string
}) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    let response: Response
    if (
      url.pathname !== '/api/profile/avatar' &&
      Number(request.headers.get('content-length')) > requestBodyLimit
    )
      response = new Response('Payload too large', { status: 413 })
    else if (url.pathname === '/healthz') {
      try {
        await checkHealth()
        response = Response.json({ ok: true, revision })
      } catch {
        response = Response.json({ ok: false }, { status: 503 })
      }
    } else if (url.pathname.startsWith('/api/trpc/')) {
      if (
        request.headers.has('origin') &&
        request.headers.get('origin') !== origin
      )
        response = new Response('Forbidden', { status: 403 })
      else response = await app(request)
    } else if (
      url.pathname.startsWith('/api/auth/') ||
      url.pathname === '/api/profile/avatar'
    )
      // Better Auth and the photo handler check origins and sessions themselves;
      // both routes 404 unless Better Auth is enabled.
      response = await app(request)
    else if (url.pathname.startsWith('/api/'))
      response = new Response('Not found', { status: 404 })
    else if (!['GET', 'HEAD'].includes(request.method))
      response = new Response('Method not allowed', { status: 405 })
    else {
      const path = resolve(clientDirectory, '.' + url.pathname)
      const file = Bun.file(path)
      if (
        url.pathname !== '/' &&
        path.startsWith(clientDirectory + '/') &&
        (await file.exists())
      )
        response = new Response(request.method === 'HEAD' ? null : file, {
          headers: { 'Content-Type': file.type }
        })
      else if (url.pathname.startsWith('/assets/'))
        response = new Response('Not found', { status: 404 })
      else response = await app(request)
    }
    response.headers.set('X-Date-Pot-Revision', revision)
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set(
      'Cache-Control',
      url.pathname.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'no-store'
    )
    return response
  }
}
