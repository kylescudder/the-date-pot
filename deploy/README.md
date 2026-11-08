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

All RPCs require a verified session from the selected provider (Clerk by
default, Better Auth when `AUTH_PROVIDER=better-auth`) and are scoped to the
member’s group. The app uses the production instance of the The Date Pot Clerk
application, served from `clerk.thedatepot.co.uk`. Do not substitute another
app's Clerk instance.

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

## Better Auth rollout and Clerk rollback

`AUTH_PROVIDER` selects exactly one authentication provider for both the server
and the rendered client. It defaults to `clerk`, so the additive release can be
deployed before the sign-in flow changes. Changing it requires recreating the
app container. With `clerk`, `/api/auth/*` returns 404 and nothing below runs.

The owner migration `0002_better_auth` adds `auth_user`, `auth_session`,
`auth_account`, `auth_verification`, `auth_passkey`, `auth_rate_limit` and
`auth_email_limit`, plus a nullable unique `user.auth_user_id` link. It also
relaxes `user.clerkId` to nullable so members who join under Better Auth need
no Clerk id. Existing rows, ids and Clerk ids are not rewritten. The runtime
keeps its four-connection pool and restricted role (the owner's default
privileges already grant it the new tables).

Prepare these settings in the host's protected `.env`, keeping the Clerk keys:

```dotenv
AUTH_PROVIDER=clerk
BETTER_AUTH_URL=https://thedatepot.co.uk
BETTER_AUTH_SECRET=<stable, cryptographically random app-specific secret, 32+ chars>
BREVO_API_KEY=<The Date Pot transactional API key>
AUTH_EMAIL_FROM=<verified Brevo sender, e.g. hello@thedatepot.co.uk>
AUTH_EMAIL_DAILY_LIMIT=40
# Optional. Empty keeps sign-up open; a list restricts accounts and mail to it.
AUTH_ALLOWED_EMAILS=
```

`BETTER_AUTH_URL` must be `https://` in production. The secret also keys the
stored email-code hashes, so keep it stable and out of Git, image layers and
CI. The passkey RP ID is the exact hostname in `BETTER_AUTH_URL`.

### Access model

The Date Pot has open sign-up: anyone can create an account with a password
(`/auth/sign-up`), an email code or a magic link. Password sign-ups must confirm
their address through an emailed link before they can sign in, and a second
sign-up for an existing address gets the same generic answer. Every tRPC call
requires a session whose email is verified (and, if `AUTH_ALLOWED_EMAILS` is set,
still listed — removing an address revokes access). A verified account with no
linked member row gets a new row (name from the profile, username = email) and
a pot of its own, matching the Clerk-era onboarding.

Sign-in lives at `/auth/<view>`: password (`/auth/sign-in`), email code
(`/auth/email-otp`), magic link (`/auth/magic-link`) and passkey, each linking to
the others, plus `/auth/sign-up`, `/auth/forgot-password` and
`/auth/reset-password`. The old Clerk `/sign-in` and `/sign-up` URLs redirect
there. Success returns to `/` or to a same-site `?redirectTo=`; off-site
`redirectTo`, `callbackURL`, `newUserCallbackURL` and `errorCallbackURL` values
are refused on the server and ignored in the client. Signed-in members get an
avatar menu (Better Auth UI `UserButton`) in the sidebar with Profile and Sign
out. `/profile` edits the display name and optional first/last names (shown to
other pot members), shows the verified email read-only, sets or changes a
password (no password yet → "Set password" emails a reset link), manages
passkeys and signs out. There is no profile photo storage, so avatars use
initials.

`/api/auth/*` forwards only: get-session, sign-out, update-user,
email-otp/send-verification-otp, sign-in/email-otp, sign-in/email, sign-up/email,
verify-email, send-verification-email, sign-in/magic-link, magic-link/verify,
request-password-reset, reset-password, `/reset-password/<token>`,
change-password, list-accounts and the passkey endpoints. Everything else is 404.

### Emails and limits

Email codes are six digits, valid once for ten minutes, with five attempts; the
database stores an HMAC of each code. Magic links (10 minutes, stored hashed),
reset links (30 minutes, single-use) and sign-up confirmation links (1 hour) use
the same branded template and logo (`public/email-logo.png`). Every email
that is actually sent shares persistent limits in `auth_email_limit` (reset
and confirmation emails reserve when they are sent, so requests for unknown
addresses spend nothing): one email per recipient
per minute, five per recipient per hour, and an app-wide budget of
`AUTH_EMAIL_DAILY_LIMIT` (default 40) per rolling 24 hours. Per-IP limits (via
`cf-connecting-ip`) apply per endpoint: 60/min overall, 3/min for sending codes,
links, resets and sign-ups, 5/min for password sign-in, reset and change, 10/min
for code and link verification, 20/min for passkeys. Brevo is called with an 8 s
timeout; responses, codes, links and keys are never logged. Sessions last seven
days and refresh daily. A password reset revokes existing sessions.

On phones, magic links open wherever the mail app opens links, so email codes
remain the most reliable mobile method. The code form keeps only the pending
email and request time in tab-scoped storage for ten minutes so a reload does
not send another email; it never stores the code.

Brevo's free plan adds a `List-Unsubscribe` header even to transactional email;
see [Brevo's explanation](https://help.brevo.com/hc/en-us/articles/19100260472850-FAQs-About-list-unsubscribe-and-list-help-headers-in-emails).

### Cutover

1. Deploy the release through the central service with `AUTH_PROVIDER=clerk` and
   the settings above. Owner migrations add the tables; behaviour is unchanged.
2. Link existing members so their pots and ratings carry over. The script lists
   Clerk users through the Clerk Backend API, takes each verified primary email,
   finds or creates the Better Auth user (marked verified) and sets
   `user.auth_user_id`. It prints counts only, is idempotent and writes nothing
   without `--apply`:

   ```sh
   docker compose --env-file .env run --rm the-date-pot bun deploy/link-clerk-users.ts
   docker compose --env-file .env run --rm the-date-pot bun deploy/link-clerk-users.ts --apply
   ```

   Review `withoutVerifiedEmail`, `withoutAppUser`, `conflicts` and
   `orphanAppUsers` before applying. Members without a verified Clerk email are
   not linked; if they sign in later they get a new, empty pot.

   If a member's Clerk email is wrong or no longer used, add
   `--email <clerk user id>=<address>` (repeatable) to both runs to link their
   existing row under the address they will sign in with. The override must
   name an existing Clerk user, and the address is treated as verified, so only
   use addresses the member has confirmed are theirs.

3. Set `AUTH_PROVIDER=better-auth` and recreate only the `the-date-pot` service
   with the same image. Verify email-code sign-in, the pot list, Profile and
   passkey enrolment. Clerk sessions stop working; members sign in again by
   email code, magic link or a reset-link password.
4. Re-run the link script with `--apply` just before the switch if new members
   joined through Clerk after step 2.

To roll back, set `AUTH_PROVIDER=clerk` and recreate the app service with the
same image. Keep the Clerk keys, its production app and DNS. Leave the auth
tables and links in place; never restore an older database to change providers.
Members who joined under Better Auth have no Clerk id and cannot sign in with
Clerk until they are linked by hand.

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
