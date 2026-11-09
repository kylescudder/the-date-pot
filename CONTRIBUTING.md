# Development checks

Use Bun 1.4.4 and install the committed dependencies with
`bun install --frozen-lockfile`. This also installs the shared Husky hook.

Before committing, stage the changes you intend to include. The pre-commit
hook checks only staged files with Prettier; it does not rewrite files. Other
work in the same file stays unstaged. Unsupported file types and paths excluded
by `.prettierignore` are skipped.

Run `bun run format` to format the repository, or
`bunx --no-install prettier --write path/to/file` to format one file, then stage
it again. `bun run format:check` checks the full repository.

CI remains the authority for full formatting, type checks, builds and existing
automated tests. React apps also run `bun run lint`; static Astro sites use
`bun run typecheck`. These broader checks do not run in the pre-commit hook.

Container builds disable hook installation with `HUSKY=0` (or skip lifecycle
scripts). Dependencies are installed explicitly after pulling changes; there
is no automatic post-merge install.
