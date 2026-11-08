# The Date Pot

A collection of films to watch, places to eat, things to do, coffee shops to rate
and vinyls to buy with your loved one.

TanStack Start (React, Router, Query) with tRPC, Drizzle on PostgreSQL and
Better Auth, served by a small Bun server. Every record belongs to a group; the
server takes the member and group from the Better Auth session and scopes every
query to that group.

## Development

Use Bun 1.4.4, matching `.bun-version` and the Dockerfile.

```sh
bun install --frozen-lockfile
cp .env.example .env   # DATABASE_URL, APP_ORIGIN, Better Auth and Brevo settings
bun run db:migrate
bun run dev
```

Authentication is Better Auth (`BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
`BREVO_API_KEY` and `AUTH_EMAIL_FROM`). Sign-in pages live at `/auth/sign-in`,
and a verified account without a member row gets one and a pot of its own. A
member's `user` row links to their account through `auth_user_id`;
`tests/fixtures/seed.sql` sets up a local group. Sign-up is open unless
`AUTH_ALLOWED_EMAILS` is set, which closes it; see
[deploy/README.md](deploy/README.md#authentication) for the access model and
limits.

| Script                     | Purpose                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `bun run typecheck`        | `tsc`                                                                                            |
| `bun run test`             | tRPC authorization, persistence and `/healthz` against Postgres (`TEST_DATABASE_URL`)            |
| `bun run test:connections` | The runtime role's connection budget                                                             |
| `bun run test:e2e`         | Playwright, signed in with a local test account (`E2E_USERNAME`, `E2E_PASSWORD`, `E2E_BASE_URL`) |
| `bun run build`            | Production build in `dist/`; `bun run start` serves it                                           |
| `bun run db:generate`      | New migration from `src/server/db/schema.ts`                                                     |
| `bun run db:migrate`       | Apply migrations (owner role only)                                                               |
| `bun run format`           | Prettier with the house style                                                                    |

`/healthz` returns `{"ok":true,"revision":"<sha>"}` once the database answers,
or 503 after 3 seconds. Every response carries `X-Date-Pot-Revision`.

The map on coffee, restaurant and activity pages needs `VITE_GOOGLE_MAPS_API_KEY`
at build time (a public, referrer-restricted key) and
`GOOGLE_MAPS_API_KEY_GEOCODING` at runtime; without them the map is not shown.

## Database

`drizzle/0000_baseline.sql` creates the schema on an empty database. The live
database predates Drizzle migrations, so on it the baseline only records itself
and changes nothing. The migration journal lives in the `drizzle` schema, which
the runtime role cannot read.

## Deployment

See [deploy/README.md](deploy/README.md) for the host, the release pipeline and
the one-off cutover from the old host.
