# The Date Pot on the host

## Shared deployment service

This app is registered as `the-date-pot` in the central deployment registry
`/Users/kyle/platform/deploy-core/apps.json`. LaunchAgent
`com.kylescudder.deploy-core` runs the single installed engine. Application hooks
are `deploy/hooks.py`; the receiver, credentials, queues, state and database
contracts below remain app-specific. Manual deployment uses
`./deploy/host-deploy.sh sha256:<digest>`.

Engine updates, application registration, failure inspection and service rollback
are documented in [deploy-core](https://github.com/kylescudder/deploy-core).
Do not install an app-specific LaunchAgent, copy the engine into this repository
or start a second scheduler. Apply engine changes once through the central service.

Every push to `main` runs **Release**. CI checks types and formatting, tests
isolated Postgres owner/runtime permissions, authenticated RPC CRUD and HTTP
routing, tests the queue receiver, and builds the production image. GitHub then
builds native AMD64/ARM64 images, publishes an immutable GHCR manifest and
attests its provenance. The workflow succeeds only when the public API reports
that commit in `X-Date-Pot-Revision` and the host acknowledges the same
commit and image digest after completed acceptance checks.

## Services and trust boundaries

- Public app: https://thedatepot.co.uk, upstream `the-date-pot:3000`.
- Deploy hook: https://deploy-the-date-pot.kylescudder.co.uk/hooks/the-date-pot.
- Checkout: `/Users/kyle/platform/apps/the-date-pot`.
- LaunchAgent: `com.kylescudder.deploy-core`, running as Colima's owner.
- Deployer: the centrally installed service; application behavior lives in `hooks.py`.
- Image: `ghcr.io/kylescudder/the-date-pot@sha256:<digest>`.

One unprivileged Bun container serves the Vite build and `/api/trpc/*`. It joins
external `platform-web` and internal `platform-db` and publishes no host port.
Compose limits it to 256 MiB, one CPU, 128 processes and bounded logs, drops all
capabilities and uses a read-only root filesystem. The API uses four pooled
Postgres connections.

All RPCs require a verified Clerk session and are scoped to the member’s group. The app uses the
production instance of the The Date Pot Clerk application, served from
`clerk.thedatepot.co.uk`. Do not substitute another app's Clerk instance.

The receiver joins only `platform-web`, has no Docker socket, host shell
credentials or database access, and can write only its queue. It reads only the
completed release acknowledgement from a separate read-only mount. It checks exact
paths, HMAC-SHA256 signatures, a five-minute timestamp window, request size and
queue bounds. Cloudflare Access protects the whole deploy hostname with one
Service Auth policy allowing only `github-the-date-pot-deploy`; other
authenticated paths return 404.

The host independently verifies provenance for `kylescudder/the-date-pot`,
`.github/workflows/release.yml`, `refs/heads/main` and GitHub-hosted runners
before pulling the exact digest. Deployments are serialized; queued requests
coalesce to the newest request.

## Database and recovery

The database is `the_date_pot`, registered for weekly encrypted NAS backups.
Provision it with
`python3 /Users/kyle/platform/scripts/provision-project.py the_date_pot`.
Protected credentials stay in `/Users/kyle/platform/projects/the_date_pot/`.
Migrations use `the_date_pot_owner` in a one-shot container; the application
uses `the_date_pot_runtime`. Database credentials never enter GitHub, the image,
receiver or webhook.

After verifying an image, the host saves a private pre-deploy `pg_dump`, runs
owner migrations and waits for application health. `deploy/verify.ts` then checks
HTML, built assets, the revision header, restricted database permissions and
unauthenticated API rejection. Only completed checks publish
`state/public/deployment.json`; CI requires both that exact acknowledgement and
the public API revision.

A failed migration leaves the current app running. Failed application acceptance
restores the previous image. Migrations are not reversed, so schema changes must
remain compatible with the previous runtime. Preserve failed transaction state and
inspect `state/deploy.log` privately before retrying. Rollback uses retained host
image digests and Postgres backups only.

## Cutover from the old host

The live data is in the database behind the old Next.js deployment (created with
`drizzle-kit push`, so it has no migration history). Move it once, before the
first deploy, while the old app is paused or read-only:

1. Provision `the_date_pot` with `provision-project.py` (above).
2. Copy schema and data with the owner role, without the old ownership or grants:

   ```sh
   pg_dump --no-owner --no-privileges "$OLD_DATABASE_URL" \
     | psql "postgres://the_date_pot_owner:…@postgres:5432/the_date_pot"
   ```

3. Grant the runtime role access to the restored tables, as for any owner-created
   table: `SELECT, INSERT, UPDATE, DELETE` on all tables in `public`.
4. Deploy. `drizzle/0000_baseline.sql` only creates tables when `user` does not
   exist, so on the restored database it records the baseline and changes nothing.

The restored schema keeps whatever constraints the old database had. The code
stores the owning group's id in each `userGroupId` column, exactly as before.

## Configuration and commands

GitHub's `production` environment permits `main` only. Its secrets are
`DEPLOY_WEBHOOK_SECRET`, `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`; no
database or Clerk secret goes to GitHub. Repository variables are
`DEPLOY_ENABLED=true` and `DATE_POT_BASE_URL=https://thedatepot.co.uk`.
The Clerk publishable key is read at runtime from the host's `.env`, so the image
has no build-time configuration.

The host's `.env`, `.env.deploy-hook`, `secrets/deploy-webhook-secret` and
`secrets/cloudflare-access.json` are protected files ignored by Git and Docker.
The dedicated Access service token lasts one year; renew it before expiry and
update both GitHub Access secrets together. Never print secrets or resolved
Compose output.

From the checkout:

```sh
docker compose -f deploy/compose.deploy-hook.yaml --env-file .env.deploy-hook up -d --wait
launchctl print gui/501/com.kylescudder.deploy-core
tail -n 100 state/deploy.log
docker compose --env-file .env ps
```

Pause automatic deployment:

```sh
gh variable set DEPLOY_ENABLED --body false --repo kylescudder/the-date-pot
```

Redeploy or roll back to a previously attested main digest:

```sh
./deploy/host-deploy.sh sha256:<verified-main-digest>
```

Host `deploy/` tooling and Compose changes require a reviewed checkout update or
receiver recreation. Routine image releases do not execute host scripts
downloaded from the image. No self-hosted GitHub runner is installed. Colima and
Kyle's login session must be running; reboot recovery follows
`/Users/kyle/platform/runbook.md`.

Access must exist before registering the exact hook route. From the platform:

```sh
python3 scripts/hostname.py add the-date-pot-deploy deploy-the-date-pot.kylescudder.co.uk --upstream the-date-pot-deploy-hook:9000 --path /hooks/the-date-pot --dry-run
python3 scripts/hostname.py add the-date-pot thedatepot.co.uk --upstream the-date-pot:3000 --dry-run
```

App secrets, hooks, Compose and state follow the shared encrypted NAS backup
contract.

## Database connection budget

The runtime role is limited to eight PostgreSQL connections. Application work
uses at most four, health checks at most one, and deployment verification or
database CLI work at most one. Sequential deployment commands use their own
one-connection client instead of importing the application pool. This leaves
two slots for operator connections during a release; owner migrations use a
separate role and a one-connection client. Application and owner clients retire
idle connections after 20 seconds and allow 10 seconds to connect. Health keeps
its separate three-second deadline.

CI exercises the real application and deployment clients against an
eight-connection test role, with all four application slots held open. Concurrent
deployment queries must share one backend, health must still connect, two spare
slots must remain usable, and a ninth connection must be rejected by PostgreSQL.
