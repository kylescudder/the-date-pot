// The Date Pot deploy webhook receiver. Internet-facing via Cloudflare Tunnel and
// Caddy, so it has no Docker access: it verifies a signed request and drops it
// into a spool directory. An event-driven host service picks it up and runs
// deploy/host-deploy.sh, which verifies the image attestation itself.
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto'
import {
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
  unlinkSync
} from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'

const secret = readFileSync(
  process.env.WEBHOOK_SECRET_FILE || '/run/secrets/deploy_webhook_secret',
  'utf8'
).trim()
if (secret.length < 32)
  throw new Error('Webhook secret must be at least 32 characters.')
const spool = process.env.SPOOL_DIR || '/spool'
const port = Number(process.env.PORT || 9000)
const maxBody = 8192
const maxSkewSeconds = 300
const deployedStateFile =
  process.env.DEPLOYED_STATE_FILE || '/release-state/deployment.json'

const log = (message) =>
  console.log(`[deploy-hook] ${new Date().toISOString()} ${message}`)
const reply = (response, status, message) => {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Date-Pot-Deploy-Hook': '1'
  })
  response.end(`${message}\n`)
}

function validSignature(body, header) {
  const expected = Buffer.from(
    `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  )
  const received = Buffer.from(String(header || ''))
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  )
}

function parseRequest(body) {
  const request = JSON.parse(body.toString('utf8'))
  const { digest, revision, timestamp, registryToken } = request ?? {}
  if (!/^sha256:[0-9a-f]{64}$/.test(digest)) throw new Error('invalid digest')
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('invalid revision')
  if (
    !Number.isInteger(timestamp) ||
    Math.abs(Date.now() / 1000 - timestamp) > maxSkewSeconds
  )
    throw new Error('stale or invalid timestamp')
  if (
    registryToken !== undefined &&
    (typeof registryToken !== 'string' ||
      !/^[-A-Za-z0-9._~+\/]{20,4096}={0,2}$/.test(registryToken))
  )
    throw new Error('invalid registry token')
  return {
    digest,
    revision,
    timestamp,
    ...(registryToken ? { registryToken } : {})
  }
}

createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/healthz')
    return reply(response, 200, 'ok')
  if (request.method === 'GET' && request.url === '/hooks/the-date-pot') {
    let status = { status: 'pending' }
    try {
      const value = JSON.parse(readFileSync(deployedStateFile, 'utf8'))
      if (
        /^[0-9a-f]{40}$/.test(value.revision) &&
        /^ghcr\.io\/kylescudder\/the-date-pot@sha256:[0-9a-f]{64}$/.test(
          value.image
        )
      )
        status = {
          status: 'deployed',
          revision: value.revision,
          image: value.image
        }
    } catch {}
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Date-Pot-Deploy-Hook': '1'
    })
    return response.end(JSON.stringify(status))
  }
  if (request.method !== 'POST' || request.url !== '/hooks/the-date-pot')
    return reply(response, 404, 'not found')
  const chunks = []
  let size = 0
  request.on('data', (chunk) => {
    size += chunk.length
    if (size > maxBody) {
      reply(response, 413, 'too large')
      request.destroy()
    } else chunks.push(chunk)
  })
  request.on('end', () => {
    if (response.writableEnded) return
    const body = Buffer.concat(chunks)
    if (!validSignature(body, request.headers['x-date-pot-signature'])) {
      log('rejected request with invalid signature')
      return reply(response, 401, 'invalid signature')
    }
    let deploy
    try {
      deploy = parseRequest(body)
    } catch (error) {
      log(`rejected signed request: ${error.message}`)
      return reply(response, 400, error.message)
    }
    // Keep both paths on the same bind mount: rename across separate mounts
    // fails with EXDEV even when the host directories share a filesystem.
    const requests = join(spool, 'requests')
    if (readdirSync(requests).length >= 64)
      return reply(response, 503, 'queue full')
    const name = `${deploy.timestamp}-${deploy.revision}-${randomUUID()}.json`
    const temporary = join(requests, `.${name}.tmp`)
    try {
      writeFileSync(temporary, JSON.stringify(deploy), {
        mode: 0o600,
        flag: 'wx'
      })
      renameSync(temporary, join(requests, name))
    } catch {
      try {
        unlinkSync(temporary)
      } catch {}
      log('could not persist request')
      return reply(response, 503, 'queue unavailable')
    }
    log(`queued ${deploy.digest} (${deploy.revision})`)
    reply(response, 202, 'queued')
  })
}).listen(port, '0.0.0.0', () => log(`listening on ${port}`))
