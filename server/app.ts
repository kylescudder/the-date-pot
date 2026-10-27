import { resolve } from 'node:path'

type Handler = (request: Request) => Response | Promise<Response>

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
    if (url.pathname === '/healthz') {
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
    } else if (url.pathname.startsWith('/api/'))
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
