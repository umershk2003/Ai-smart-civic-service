# 🏙️ AI Smart Civic Services Platform

An intelligent, AI-powered civic complaint classification, prioritization, automated routing, and municipal management platform built for citizens and city administration teams.

---

## 🌟 Overview

The **AI Smart Civic Services Platform** transforms how municipal issues (such as road damage, water supply disruptions, sanitation problems, street lighting failures, and public safety concerns) are reported, processed, and resolved.

Using server-side **Google Gemini AI**, the system automatically inspects citizen reports—including description text, attached photographs, and structured Pakistan location data (province → district → municipality → ward)—to classify civic complaints, calculate emergency priority scores (1–100), determine SLA resolution windows, and route tasks instantly to the correct municipal department.

---

## ✨ Key Features

### 🤖 1. AI Analysis & Smart Auto-Routing
* **Instant Multimodal Classification**: Uses Google Gemini to detect category, subcategory, and target department from user reports and uploaded photos.
* **Dynamic Priority Scoring**: Generates priority levels (`Low`, `Medium`, `High`, `Critical`) and emergency scores based on public safety hazards and keywords.
* **Automated SLA Calculation**: Assigns estimated SLA resolution hours dynamically based on complaint severity.

### 👥 2. Role-Based Dashboards & Workflows
* **Citizen Portal**:
  * Easy complaint submission with photo upload & GPS ward targeting.
  * Unique tracking IDs for real-time status monitoring (`Submitted` ➔ `In Progress` ➔ `Resolved`).
  * Citizen feedback & rating system upon ticket completion.
* **Field Officer Workspace**:
  * Mobile-friendly task management for field workers.
  * Photo verification for "Before" and "After" repairs.
  * Cost estimation and material/labor breakdown tracking.
* **Supervisor Dashboard**:
  * Field team assignment and work-order management.
  * SLA deadline tracking and category/department override controls.
  * Re-work requests and quality assurance sign-offs.
* **Municipal Admin Portal**:
  * City-wide analytics on SLA compliance, ward distribution, and category trends.
  * Management of dynamic civic categories, subcategories, and SLA benchmarks.
  * System-wide audit history and logs.
* **Super Admin Controls**:
  * Global user role governance (`Citizen`, `Field Officer`, `Supervisor`, `Municipal Admin`, `Super Admin`).
  * Account status management and permission oversight.

### 📊 3. Real-Time Civic Analytics & Reporting
* **Interactive Charts**: Powered by Recharts to display category breakdowns, monthly resolution trends, ward-by-ward complaint density, and priority ratios.
* **Audit Trail**: Detailed change history for every ticket, recording status transitions, officer assignments, and category override justifications.

### 💬 4. Intelligent Civic AI Assistant
* Integrated conversational bot providing instant responses for citizens inquiring about complaint progress, municipal services, or civic guidelines.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion (Framer Motion), Recharts, Lucide Icons.
* **Backend**: Python 3.11+, **FastAPI** (`backend/app/`) served by uvicorn on port 8000; the Vite dev server proxies `/api/*` to it. Persistence via **SQLAlchemy + SQLite** (`backend/data/civic.db`, Alembic migrations); **JWT auth** (PyJWT) on hardened endpoints. (The original Express backend lives on as `server.ts` via `npm run dev:express` for rollback.)
* **AI Integration**: `google-genai` (Google GenAI Python SDK with Gemini models), with a built-in rule-based fallback when no API key is set.

---

## 📂 Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/              #   main.py, models.py (Pydantic), db.py (SQLAlchemy+SQLite), deps.py (RBAC/JWT), auth.py, routers/
│   ├── alembic/          #   database migrations (backend/data/civic.db, auto-seeded on first run)
│   ├── seed/             #   seed_data.json + locations.json (generated from src/data via scripts/export_seed.mjs)
│   ├── tests/            #   shared HTTP contract suite (runs against Express OR FastAPI)
│   └── tests_fastapi/    #   FastAPI-only endpoint tests (auth gates, Pakistan location hierarchy)
├── scripts/              # dev-api.mjs, start-api.mjs, export_seed.mjs
├── server.ts             # Legacy Express backend (rollback only; npm run dev:express)
├── src/
│   ├── App.tsx           # Main application router and shell
│   ├── auth/             # Role-based user authentication and context state
│   ├── components/       # Modular UI components (Dashboards, Forms, Analytics, Modals)
│   ├── data/             # Initial mock data, categories, locations (Pakistan hierarchy), audit logs
│   ├── types.ts          # Shared TypeScript interfaces and domain types
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind CSS directives
├── .env.example          # Sample environment variables template
├── vite.config.ts        # Vite dev server (:3000) + /api proxy to FastAPI (:8000)
├── package.json          # Project dependencies and script definitions
└── tsconfig.json         # TypeScript compiler configuration
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18 or higher
* **npm** or **bun** / **yarn**
* **Python 3.11+** (for the FastAPI backend)
* **Google Gemini API Key**: Optional for live server-side AI classification features (will use fallback mock analysis if absent).

### Installation & Local Setup

1. **Clone the repository** (or navigate to project directory):
   ```bash
   git clone <repository-url>
   cd ai-smart-civic-services
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Install Python dependencies** (project-local venv):
   ```bash
   python -m venv --system-site-packages .venv
   .venv/Scripts/python.exe -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
   ```
   (POSIX: `.venv/bin/python`.)

4. **Generate the backend seed JSON** (needed once, and after `src/data` seed changes):
   ```bash
   npm run seed:export
   ```

5. **Configure Environment Variables** *(optional)*:
   The app runs fine with no `.env` — without a key the AI features use a built-in rule-based fallback. For **live Gemini AI** (real complaint classification + assistant answers), copy `.env.example` to `.env` and set your key, then restart the dev server:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Starts both servers via `concurrently`:
   * **API** — FastAPI/uvicorn on `http://127.0.0.1:8000` (SQLite persistence, auto-seeded on first run)
   * **Web** — Vite dev server on `http://127.0.0.1:3000`, proxying `/api/*` to the backend

7. **Open the app** at **http://localhost:3000** and sign in (see demo accounts below).

### 🔑 Demo Accounts

Click **Sign in** on the landing page and use any of the five pre-seeded accounts (or pick one from the "Explore with a demo account" list in the sign-in modal):

| Role | Email | Password | Persona |
| --- | --- | --- | --- |
| Citizen | `citizen@civic.com` | `citizen123` | Zoya Khan |
| Field Officer | `officer@civic.com` | `officer123` | Imran Shahid |
| Supervisor | `supervisor@civic.com` | `supervisor123` | Khalid Mehmood |
| Municipal Admin | `admin@civic.com` | `admin123` | Ahmed Khan |
| Super Admin | `superadmin@civic.com` | `superadmin123` | Zain ul Abideen |

### ✅ Verify It's Running

```bash
curl http://127.0.0.1:3000/api/health   # proxied → FastAPI; expect {"status":"ok"}
```

### 🧪 Running the Tests

```bash
./.venv/Scripts/python.exe -m pytest backend/tests -q                        # 42 contract tests (via :3000 proxy)
./.venv/Scripts/python.exe -m pytest backend/tests_fastapi --base-url http://127.0.0.1:8000 -q  # 33 FastAPI-only tests
```

### 🔄 Resetting Demo Data

All complaints, categories, and audit logs persist in SQLite (`backend/data/civic.db`). To reset to the clean seeded state:
* Use the in-app **"Reset demo data"** button, or
* Stop the server and `rm -f backend/data/civic.db`, then run `npm run dev` again (re-seeds on startup).

---

## 📜 Available Scripts

* `npm run dev`: Runs FastAPI (uvicorn, :8000) + Vite (:3000) together via `concurrently`.
* `npm run dev:web` / `npm run dev:api`: Frontend or backend alone.
* `npm run dev:express`: Legacy Express backend (rollback; requires the pre-migration setup).
* `npm run build`: Bundles the Vite frontend app into `dist/`.
* `npm run start`: Starts FastAPI in production mode, serving `dist/` + the API on port 8000.
* `npm run seed:export`: Regenerates `backend/seed/*.json` from the TypeScript seed modules.
* `npm run lint`: Performs TypeScript type checking across the project (`tsc --noEmit`).
* **Contract tests**: `.venv/Scripts/python.exe -m pytest backend/tests -q` (see `.freebuff/run.md`).

---

## 🔒 Security & Best Practices

* **Server-Side API Calls**: All Gemini API queries are proxied via FastAPI backend endpoints to ensure API keys are never exposed in browser bundles.
* **JWT Authentication**: Sensitive endpoints (audit logs, ticket detail/update) require a JWT from `/api/auth/login` (demo accounts) or `/api/auth/demo-login`; the frontend attaches it automatically. The legacy `x-user-role` header remains the identity source for the self-service surface.
* **Role Separation**: Strict UI and workflow segregation based on authenticated user roles.

---

## 📄 License

This project is licensed under the MIT License.
