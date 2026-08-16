# AGENTS.md

## Cursor Cloud specific instructions

Lbook is a personal reading-catalog app (React + Vite + Tailwind). It is an npm
workspace monorepo with `client/` (the React app) and `server/` (a legacy Express
API). Standard commands live in `package.json`, `client/package.json`, and the
`README.md`; prefer those instead of duplicating them.

### Modes (how the app persists data)

The same UI runs in three modes, selected at build/run time:

- **App** — Supabase Auth + Postgres. Requires `client/.env` with
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` pointing at a real Supabase
  project. These are NOT provisioned in this environment, so App mode cannot run
  here without those secrets. Run with `npm run dev:app`.
- **Demo** — `localStorage`, no backend, no login. Fully self-contained. Run with
  `VITE_DATA_SOURCE=local npm run dev:app`. On first load it seeds example
  readings. This is what deploys to GitHub Pages.
- **Legacy** — Express + local PostgreSQL, no login. Fully self-contained once
  Postgres is running. Run the whole stack with `npm run dev` (Express on `:3000`,
  Vite client on `:5173`). The client's `store.js` automatically uses the Express
  API when Supabase is not configured and `VITE_DATA_SOURCE` is not `local`.

### Postgres for legacy mode

PostgreSQL 16 is installed via apt (part of the VM snapshot, not the update
script). It is NOT auto-started on boot in this container, so start the cluster
before running `npm run dev`:

```bash
sudo pg_ctlcluster 16 main start
```

The `lbook` database and a `postgres`/`postgres` login already exist in the
snapshot's data directory. `server/.env` (gitignored) is set to
`postgresql://postgres:postgres@localhost:5432/lbook`. The server auto-creates and
migrates the `books` table on startup (`ensureSchema`), so no manual migration is
needed. If the DB is ever missing, recreate it with `sudo -u postgres createdb lbook`.

### Test / build

- Tests: `npm test` (Vitest, runs in `client/`). There is currently only a small
  unit-test suite (`client/src/lib/identity.test.js`).
- Build: `npm run build -w lbook-client` (Vite production build → `client/dist`).
- There is no lint script or linter configured in this repo.

### Gotchas

- The Vite dev server is hardcoded to `--port 5173`. To run Demo and Legacy at the
  same time, give the second one another port, e.g.
  `VITE_DATA_SOURCE=local npm run dev:app -- --port 5174`.
- The Vite proxy forwards `/api` and `/uploads` to `VITE_API_TARGET`
  (default `http://localhost:3000`). The Express server intentionally exits if
  port 3000 is busy rather than picking another port, so free `:3000` before
  starting legacy mode.
