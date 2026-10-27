import assert from 'node:assert/strict'
import { createDeploymentDatabase } from './database'
const base = 'http://127.0.0.1:3000'
const health = await fetch(base + '/healthz')
assert.equal(health.status, 200)
assert.equal(
  health.headers.get('x-date-pot-revision'),
  process.env.DATE_POT_REVISION
)
assert.equal((await health.json()).ok, true)
for (const path of ['/', '/beers', '/films', '/sign-in', '/sign-up']) {
  const response = await fetch(base + path)
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.match(html, /The Date Pot/)
  if (path === '/')
    for (const asset of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
      const built = await fetch(base + asset[1])
      assert.equal(built.status, 200)
      assert.ok(!built.headers.get('content-type')?.includes('text/html'))
    }
}
for (const headers of [
  new Headers(),
  new Headers({ Authorization: 'Bearer invalid' })
]) {
  const response = await fetch(base + '/api/trpc/beer.list', { headers })
  assert.equal(response.status, 401)
  assert.equal(response.headers.get('cache-control'), 'no-store')
}
assert.equal(
  (
    await fetch(base + '/api/trpc/beer.list', {
      headers: { Origin: 'https://untrusted.example' }
    })
  ).status,
  403
)
assert.equal((await fetch(base + '/assets/does-not-exist.js')).status, 404)
const sql = createDeploymentDatabase(process.env.DATABASE_URL!)
try {
  const [role] =
    await sql`SELECT current_user AS name, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user`
  assert.equal(role.name, 'the_date_pot_runtime')
  assert.equal(role.rolsuper || role.rolcreatedb || role.rolcreaterole, false)
  const [grants] =
    await sql`SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS can_create`
  assert.equal(grants.can_create, false)
  await sql`SELECT id FROM beer LIMIT 1`
} finally {
  await sql.end()
}
console.log(
  'HTML/assets, revision, database, restricted role and unauthenticated API checks passed'
)
