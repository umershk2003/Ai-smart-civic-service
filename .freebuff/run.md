# Run Doc — AI Smart Civic Services

**Backend: FastAPI (Python, uvicorn on :8000) · Frontend: React 19 + Vite (dev server on :3000).**
`npm run dev` runs both via `concurrently`; Vite proxies `/api/*` to the FastAPI app.

## Reproduce uncommitted artifacts

A fresh checkout needs:

- **Node deps**: `npm install` (repo ships `bun.lock`, but `npm` is used here — README lists npm/bun/yarn as equivalent; creates `package-lock.json`).
- **Python venv**: `python -m venv --system-site-packages .venv`
  then `.venv/Scripts/python.exe -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt`
  (Windows path; POSIX: `.venv/bin/python`).
- **Seed JSON**: the FastAPI backend loads `backend/seed/*.json`, generated from the TypeScript seeds.
  Regenerate after seed/location changes with `npm run seed:export` (runs `scripts/export_seed.mjs` via tsx).
- **SQLite DB**: records persist in `backend/data/civic.db` (auto-created and gitignored). On first run it
  seeds from the JSON; afterwards it survives restarts. Wipe it to re-seed from scratch, or use the
  in-app "Reset demo data" button. Schema migrations: `cd backend && .venv/Scripts/python.exe -m alembic upgrade head`.
- **Environment**: no `.env` copy required to *run* (both backends fall back to rule-based AI without a key).
  For **live Gemini AI** (real classification + assistant answers), paste a key into `.env`
  (`GEMINI_API_KEY=...`; get one at https://aistudio.google.com/apikey) and **restart `npm run dev`**
  so the API process re-reads it. Optional `JWT_SECRET` (default is a dev-only placeholder).
- **Auth**: hardened endpoints (audit logs, ticket detail/update) require a JWT minted by
  `POST /api/auth/login` (demo accounts) or `POST /api/auth/demo-login {role}`; the frontend attaches
  it automatically. The legacy `x-user-role` header still drives the self-service surface.
- **Real-time layer**: `GET /api/events/stream?token=<jwt>` is an SSE stream (JWT as query param —
  EventSource can't set headers). Events: `complaint.created` / `complaint.updated` / `category.updated` /
  `notification.new`. Notifications persist in SQLite (`kind=notification`), are role-scoped, and read
  state is **per-role** (`readBy`). `GET /api/notifications`, `POST /api/notifications/read`. An SLA
  escalator (`backend/app/sla.py`) scans every 45s (and immediately on startup/seed-reset), firing one
  deduplicated critical notification per breached open ticket (staff roles: supervisor, municipal_admin,
  super_admin, field_officer). The frontend re-syncs the feed/stream when the JWT lands
  (`civic:auth-token` event) — don't remove that wiring.

## Run the server

```bash
npm run dev
```

Starts two processes (concurrently, `-k`):

- **api** — `node scripts/dev-api.mjs` → uvicorn `backend.app.main:app` on `http://127.0.0.1:8000` (`--reload`).
- **web** — `vite` on `http://127.0.0.1:3000` (host `127.0.0.1`, `strictPort`), proxying `/api/*` → :8000.

Health checks: `GET http://127.0.0.1:3000/api/health` (proxied) or `GET http://127.0.0.1:8000/api/health` (direct).

Other scripts: `dev:web` (vite only) · `dev:api` (uvicorn only) · `dev:express` (old Express backend, rollback)
· `build` (`vite build`) · `start` (uvicorn in production mode serving `dist/`).

Detached background start (for previews), logging to `.freebuff/preview-*.log`:

```bash
npm run dev > .freebuff/preview-<id>.log 2>&1 &
```

## Contract test suite (backend/tests)

HTTP-level pytest suite that runs against whichever backend is up — Express or FastAPI:

```bash
./.venv/Scripts/python.exe -m pytest backend/tests -q                          # default :3000 (proxied)
./.venv/Scripts/python.exe -m pytest backend/tests --base-url http://127.0.0.1:8000 -q
./.venv/Scripts/python.exe -m pytest backend/tests_fastapi --base-url http://127.0.0.1:8000 -q  # FastAPI-only (auth, locations, live)
```

Known quirk: uvicorn `--reload` is unreliable on this machine (reloaded workers have served stale code
or died mid-reload). After editing backend Python, verify the API actually changed, or do a clean
restart: kill everything on :3000/:8000, `rm -f backend/data/civic.db`, then `npm run dev` again.
```
