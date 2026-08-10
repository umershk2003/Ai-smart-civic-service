"""AI Smart Civic Services — FastAPI backend.

Serves the same REST API contract as the retired Express server.ts.

Dev topology:
    Vite dev server (:3000)  --proxy /api/*-->  uvicorn this app (:8000)

Prod topology:
    uvicorn this app (:8000, NODE_ENV=production) serves dist/ + SPA fallback.

Run:
    .venv/Scripts/python.exe -m uvicorn backend.app.main:app --reload --port 8000
"""
import asyncio
import os
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Honor a project .env file (GEMINI_API_KEY etc.) — mirrors the Node dotenv flow.
# Never overrides variables already present in the process environment.
load_dotenv()

from .routers import ai, audit, auth, categories, complaints, health, live, locations, system
from .sla import sla_task


@asynccontextmanager
async def lifespan(app: FastAPI):
    # SLA breach escalation: first scan runs immediately, then periodically.
    task = asyncio.create_task(sla_task())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


app = FastAPI(
    title="AI Smart Civic Services API",
    version="2.1.0",
    description="Municipal complaint & service management platform (FastAPI port of the Express backend).",
    lifespan=lifespan,
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Express parity: errors serialize as {"error": "..."}, not {"detail": ...}."""
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(audit.router)
app.include_router(live.router)
app.include_router(categories.router)
app.include_router(complaints.router)
app.include_router(ai.router)
app.include_router(system.router)
app.include_router(locations.router)


# ---------------------------------------------------------------------------
# Production static serving (mirrors Express: express.static(dist) + SPA fallback)
# ---------------------------------------------------------------------------
DIST_DIR = Path(__file__).resolve().parents[2] / "dist"

if os.environ.get("NODE_ENV") == "production" and DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        candidate = DIST_DIR / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST_DIR / "index.html")
