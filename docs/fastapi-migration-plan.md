# FastAPI Migration Plan — AI Smart Civic Services

**Status:** Design / proposal
**Target:** Port the existing Express (`server.ts`) backend to FastAPI with **zero API-contract changes**, preserving RBAC, in-memory seed data, the Pakistan location system, and the Gemini AI integration.

---

## 1. Current Backend (Express) — Inventory

| # | Method & Path | Role gate (from `extractUserRole`) | Behavior to preserve |
|---|---|---|---|
| 1 | `GET /api/health` | none | `{ status: 'ok', timestamp }` |
| 2 | `GET /api/categories` | none | returns `categoriesDB` array |
| 3 | `POST /api/categories` | `municipal_admin` \| `super_admin` else **403** | validates name/description/department (**400**), generates `cat-<ts>`, prepends audit entry, returns **201** |
| 4 | `PATCH /api/categories/:id` | `municipal_admin` \| `super_admin` else **403** | merges body over existing (**404** if missing), stamps `updatedAt`, prepends audit entry |
| 5 | `GET /api/audit-logs` | *none (comment claims admin-only — see §6 quirk)* | returns `auditLogsDB` |
| 6 | `GET /api/complaints` | role-scoped filtering | see §3.3 |
| 7 | `GET /api/complaints/:idOrTracking` | none | matches `id` OR case-insensitive `trackingId` (**404** otherwise) |
| 8 | `POST /api/analyze-complaint` | none | Gemini JSON analysis, rule-based fallback on no key/error — see §4 |
| 9 | `POST /api/complaints` | none | validates description+citizenName (**400**), generates `CIV-2026-<4 digits>` + `cmp-<ts>`, Karachi default location fallback, default analysis fallback, prepends audit entry, returns **201** |
| 10 | `PATCH /api/complaints/:id` | *none* | merge semantics (§3.4); audit entry on category override; `resolutionDate` only set on transition → `Resolved` |
| 11 | `POST /api/chat-assistant` | none | builds `statsSummary`, Gemini chat or canned reply |
| 12 | `POST /api/seed-reset` | none | restores all three DBs from seed, returns `{ message, count }` |

**Infrastructure facts**
- Runtime: Node + TypeScript via `tsx server.ts` (dev) / esbuild bundle `dist/server.cjs` (prod). Port **3000** hardcoded.
- Auth: header-based `x-user-role` (whitelist of 5 roles, unknown/missing → `citizen`). No tokens, no sessions — a demo contract the frontend sends on every fetch.
- Data: three in-memory arrays — `complaintsDB`, `categoriesDB`, `auditLogsDB` — seeded at module load from `src/data/seedData.ts`, `src/data/categoriesData.ts`, `src/data/auditLogData.ts`.
- AI: `@google/genai` (`GoogleGenAI`), model `gemini-3.6-flash`, `responseMimeType: application/json` + `responseSchema`. `getGeminiClient()` → `null` when `GEMINI_API_KEY` missing/placeholder, forcing the fallback.
- Static serving: dev = Vite middleware in-process; prod = `express.static(dist)` + `*` → `index.html` SPA fallback.

---

## 2. Target Architecture

```
Dev (two processes, no CORS needed):
  Vite dev server (port 3000)  ──proxy /api/*──▶  uvicorn FastAPI (port 8000)
      │ serves the React app, HMR
      └─ vite.config.ts: server.proxy { '/api': 'http://127.0.0.1:8000' }

Prod (single process):
  uvicorn FastAPI (port 8000)
      ├─ serves ./dist (vite build output) via StaticFiles
      └─ SPA fallback: GET * → dist/index.html (except /api/*)
```

**Why two processes in dev:** the current single-process trick (Express embedding Vite middleware) is a Node idiom; FastAPI cannot run Vite middleware in-process. A proxy in `vite.config.ts` keeps the frontend completely unchanged — same origin `fetch('/api/...')` calls keep working.

**Proposed layout**

```
backend/
  app/
    __init__.py
    main.py            # FastAPI app, router registration, static serving, startup seed load
    config.py          # Settings (port, gemini key, seed paths) via pydantic-settings
    db.py              # In-memory DB class + asyncio.Lock + seed loader
    deps.py            # extract_user_role, require_roles(...) dependencies
    models.py          # Pydantic models (mirror src/types.ts)
    routers/
      health.py
      categories.py
      complaints.py
      audit.py
      ai.py            # analyze-complaint + chat-assistant
      system.py        # seed-reset (+ optional /api/locations/*)
  seed/seed_data.json  # exported once from the TS seeds (see §3.2)
  tests/               # contract/parity tests (see §8)
requirements.txt
scripts/export_seed.mjs  # runs with node/tsx to emit backend/seed/seed_data.json
```

Frontend tree (`src/`, `index.html`, `vite.config.ts`, `server.ts`) stays put; `server.ts` is retired only after parity tests pass (Phase 6).

---

## 3. Data Layer & Contract Parity

### 3.1 Pydantic models — mirror `src/types.ts` exactly
Port every interface verbatim as Pydantic v2 models with the same field names and optionality:

- `LocationData` — the **Pakistan hierarchy** (`provinceId…wardId`, `area`, `address`, `ward`, `landmark`, plus backward-compat `latitude/longitude`). Keep `latitude`/`longitude` optional and unused by the UI, exactly as today.
- `CivicCategoryDef`, `AuditEntry`, `AIClassification`, `CategoryOverride`, `CitizenFeedback`, `CostBreakdown`, `AIAnalysisResult`, `Complaint` (all fields), `UserAccount`, `AnalyticsStats`, `ChatMessage`.
- Enums: `CivicPriority` (Low/Medium/High/Critical), `ComplaintStatus` (8 values incl. `Reopened`/`Rejected`), `ExtendedUserRole` (5 roles).
- Use `Literal`/`StrEnum` for these to keep serialization byte-identical (JSON key order does not matter; names and types do).
- `supervisorOverride: any` → `dict[str, Any]` (it is passed through unvalidated today — preserve that).

### 3.2 Seed strategy — one source of truth, zero drift
The seeds are **TypeScript modules** (`initialComplaints`, `defaultCategories`, `initialAuditLogs`). Do not hand-copy into Python.

- Add `scripts/export_seed.mjs`: imports the three TS modules (via `tsx`), writes `backend/seed/seed_data.json` as `{ complaints, categories, auditLogs }`.
- FastAPI `db.py` loads that JSON at startup into the in-memory store (pydantic-validated).
- Commit the generated JSON; regenerate with `npm run seed:export` whenever the TS seeds change.
- **Pakistan location system is preserved automatically** — it lives inside `Complaint.location` and the exported JSON. (The `src/data/locations.ts` hierarchy stays client-side for the cascading dropdowns; see Phase 7 optional server endpoints.)

### 3.3 `GET /api/complaints` — replicate filter order exactly
Same query params (`category, priority, status, search, department, ward, officer`), same semantics:

1. `field_officer` **and** `officer` param → keep `assignedOfficer === officer` or unassigned.
2. `supervisor` **and** `department` ≠ `All` → keep `assignedDepartment === department`.
3. Apply each provided non-`All` filter (category, priority, status, department, ward-by-display-name).
4. `search` → case-insensitive substring over title, description, trackingId, citizenName, address, category.
5. Sort by `createdAt` descending.

### 3.4 `PATCH /api/complaints/:id` — preserve merge quirks
- Merge provided fields only: `status`, `category`, `subcategory` (explicit `undefined` clears), `assignedDepartment`, `assignedOfficer` (explicit `undefined` clears), `priority`, `resolutionNotes`, `supervisorOverride`, `auditHistory` (replaces when an array).
- `resolutionDate` set **only** when `status` transitions **to** `Resolved` from a non-Resolved status.
- Prepend an audit entry when `category` changes (label user as `Department Supervisor` for `supervisor`, else `Municipal Admin`).

### 3.5 Concurrency
Handlers are async; the three DBs are shared mutable state. Wrap mutations in a module-level `asyncio.Lock` (or a tiny DB class owning a lock). Reads can be lock-free or share the lock — demo scale makes either fine; document the choice.

---

## 4. AI Parity (Gemini + Fallback)

- Python SDK: `google-genai` (same family as the TS `@google/genai`). Client init gated on `GEMINI_API_KEY` — same null-object pattern; `None` → fallback.
- Model: `gemini-3.6-flash`; `system_instruction` prompts copied **verbatim** from `server.ts`.
- `analyze-complaint`:
  - Accept `complaintText, imageBase64, imageMimeType, citizenLocation`; **400** if text missing/blank.
  - Inline image data: strip `data:image/\w+;base64,` prefix, pass mimeType.
  - Enforce schema with `response_mime_type="application/json"` + `response_schema` (use the `google.genai.types` schema builders or `response_schema_json`).
  - **Port the rule-based fallback keyword-for-keyword**: pothole/road/asphalt/pavement → Roads & Potholes/Public Works; water/pipe/leak/gush → Water Supply & Leakage/Water & Sanitation (Critical on burst/flooding); garbage/waste/trash/dumpster → Waste Management; spark/light/wire/electricity/transformer → Electricity & Streetlights (Critical on spark/school); drain/sewage/clog/waterlog → Drainage & Sewage; park/tree/branch/grass → Parks & Sanitation. Same priority scores, SLA hours, `confidence: 85`, `needsHumanReview: priority == Critical`.
- `chat-assistant`: build the identical `statsSummary` object (complaint brief list with the same keys), same canned reply template when no key.

---

## 5. RBAC Dependencies (FastAPI)

```python
ROLES = {"citizen", "field_officer", "supervisor", "municipal_admin", "super_admin"}

def extract_user_role(request: Request) -> ExtendedUserRole:
    role = request.headers.get("x-user-role")
    return role if role in ROLES else "citizen"          # same fallback as Express

def require_roles(*allowed: ExtendedUserRole):
    async def dep(request: Request, role: ExtendedUserRole = Depends(extract_user_role)) -> None:
        if role not in allowed:
            raise HTTPException(status_code=403, detail="Permission denied: ...")
    return dep
```

Apply:
- `POST/PATCH /api/categories` → `Depends(require_roles("municipal_admin", "super_admin"))` with the **exact current 403 message**: `Permission denied: Category management requires Municipal Admin or Super Admin role`.
- Complaint scoping stays inside the route (it needs query params), using `extract_user_role`.
- **Contract note:** today `GET /api/audit-logs`, `GET /api/complaints/:idOrTracking`, and `PATCH /api/complaints/:id` have **no** role gate. Keep them ungated in v1 of the migration to avoid breaking the frontend (the UI already hides them per role); flag the discrepancy as a deliberate security hardening item for a later release (the frontend's own `canAccessTab`/`canPerformAction` already hides these from unauthorized users, and the backend remains authoritative for what it does gate).

---

## 6. Endpoint Mapping Table (Express → FastAPI)

| Express | FastAPI | Notes |
|---|---|---|
| `GET /api/health` | `GET /api/health` | |
| `GET /api/categories` | `GET /api/categories` | |
| `POST /api/categories` | `POST /api/categories` | `Depends(require_roles(...))`; 400/403/201 |
| `PATCH /api/categories/:id` | `PATCH /api/categories/{id}` | 404/403; audit entry |
| `GET /api/audit-logs` | `GET /api/audit-logs` | ungated (see §5 note) |
| `GET /api/complaints` | `GET /api/complaints` | scoping + 6 filters + sort (§3.3) |
| `GET /api/complaints/:idOrTracking` | `GET /api/complaints/{id_or_tracking}` | 404 |
| `POST /api/analyze-complaint` | `POST /api/analyze-complaint` | §4 |
| `POST /api/complaints` | `POST /api/complaints` | 400/201; `CIV-2026-XXXX`; Karachi fallback location; audit entry |
| `PATCH /api/complaints/:id` | `PATCH /api/complaints/{id}` | §3.4 quirks |
| `POST /api/chat-assistant` | `POST /api/chat-assistant` | §4 |
| `POST /api/seed-reset` | `POST /api/seed-reset` | reload DBs from `seed_data.json` |

Response models: use `response_model=` for every route so the OpenAPI schema is generated for free — but confirm serialization matches (e.g., `timestamp` as ISO-8601 string, not datetime objects, unless the frontend tolerates it; safest is `str` fields, which mirrors the TS `string` types).

---

## 7. Static Serving & Dev Orchestration

- `vite.config.ts`: add
  ```ts
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } }
  ```
  (merge with the existing `server.watch.ignored: ['**/.freebuff/**']`).
- `backend/app/main.py`: if `NODE_ENV=production` (or a `SERVE_STATIC=1` flag): `app.mount("/", StaticFiles(directory="dist", html=True))` and a catch-all SPA fallback that excludes `/api/*`.
- Scripts (keep the frontend toolchain as the entry point):
  - `npm run dev:web` → `vite`
  - `npm run dev:api` → `uvicorn backend.app.main:app --reload --port 8000`
  - `npm run dev` → run both (e.g., `concurrently`) — **update `.freebuff/run.md`** to document the two processes.
- Ports: uvicorn **8000** (FastAPI default; make it env-configurable `PORT`/`API_PORT`), Vite stays **3000**. Health check the proxy by curling `http://127.0.0.1:3000/api/health` (proxied) and `http://127.0.0.1:8000/api/health` (direct).
- Env: `.env.example` gains `GEMINI_API_KEY` (already listed) and optional `API_PORT`. Never commit keys; the run doc records the *procedure*, not values.

---

## 8. Testing & Parity

1. **Contract test suite (pytest + httpx TestClient)** covering every row in §6: status codes, exact error messages, filter behavior, merge quirks, audit-log side effects, seed-reset.
2. **Cross-backend parity harness (transition only):** run Express (port 3000) and FastAPI (port 8000) side by side, replay an identical request script against both, diff JSON responses. Retire after green.
3. **Frontend smoke test:** run the existing manual flow (citizen submit → Service Desk filters → Field Portal actions → analytics → AI assistant) against the FastAPI backend in the Preview tab.
4. Keep `tsc --noEmit` for the TS side unchanged; add `pytest` to CI/verification.

---

## 9. Phased Rollout

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0 | Freeze contract | §1 inventory recorded (this doc); any drift noted |
| 1 | Scaffold FastAPI app + Pydantic models + DB + seed export script | `seed_data.json` loads; `/api/health` responds |
| 2 | Read endpoints + RBAC deps | categories, complaints (all filters), audit-logs, single complaint match §6 |
| 3 | Write endpoints | POST/PATCH complaints, POST/PATCH categories, seed-reset with quirks (§3.4) and audit entries |
| 4 | AI endpoints | analyze-complaint + chat-assistant parity incl. fallback (§4) |
| 5 | Static serving + vite proxy + orchestration | `npm run dev` runs both; production mode serves `dist/` |
| 6 | Parity + UI verification | pytest green, parity diff clean, full Preview smoke test |
| 7 | (Optional) server-side location APIs | `GET /api/locations/{provinces,divisions,districts,tehsils,municipalities,wards}` fed from a JSON export of `src/data/locations.ts`, RBAC-gated admin CRUD later — frontend keeps using its client-side cascade for now |

---

## 10. Risks & Mitigations

- **Seed drift** between TS and Python → committed JSON export generated by script (never hand-edited).
- **Serialization differences** (datetimes, key order, `null` vs `undefined`) → mirror as `str` fields; parity harness catches the rest.
- **Gemini schema differences** between SDKs → drive both from the same JSON schema; fallback path is the parity target when no key is set (CI runs without a key).
- **Behavior change** if we “fix” ungated endpoints during migration → keep contract identical in v1; hardening tracked separately.
- **Port conflicts** in the shared worktree → ports are configurable via env; run doc updated.

---

## 11. What Stays Unchanged

- Frontend `src/` (components, permission model, RBAC tabs) — zero edits beyond `vite.config.ts` proxy.
- The 5-role RBAC system and `x-user-role` header contract.
- Pakistan location system: structured IDs on complaints, Karachi default demo location.
- In-memory demo semantics (no database) — FastAPI mirrors the same in-memory model.
