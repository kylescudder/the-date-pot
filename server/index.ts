import { createApp } from './app'
import { createHealthCheck } from '../src/server/health'
import { readEnv } from '../src/server/env'

const env = readEnv()
const origin = env.APP_ORIGIN
const serverEntry = '../dist/server/server.js'
const { default: start } = (await import(serverEntry)) as {
  default: { fetch: (request: Request) => Response | Promise<Response> }
}
export default {
  maxRequestBodySize: 65536,
  hostname: '0.0.0.0',
  port: env.PORT,
  fetch: createApp({
    app: (request) => start.fetch(request),
    checkHealth: createHealthCheck(env.DATABASE_URL),
    origin,
    revision: env.DATE_POT_REVISION
  })
}
