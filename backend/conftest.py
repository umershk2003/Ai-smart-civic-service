"""Contract test suite for the AI Smart Civic Services backend.

These tests exercise the HTTP API only (no imports from the app), so the *same*
assertions run against either backend:

- Today:   Express (server.ts)   ->  http://127.0.0.1:3000   (npm run dev)
- After:   FastAPI (uvicorn)     ->  http://127.0.0.1:8000   (--base-url http://127.0.0.1:8000)

Run:
    .venv/Scripts/python.exe -m pytest backend/tests -v
    .venv/Scripts/python.exe -m pytest backend/tests --base-url http://127.0.0.1:8000 -v

Every test starts from pristine seed state (autouse /api/seed-reset fixture), so
tests are order-independent and safe to re-run against a mutated server.
"""
import os
import re

import pytest
import requests

DEFAULT_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:3000")

# When a real GEMINI_API_KEY is configured the AI endpoints call the live model,
# so strict rule-based fallback assertions only apply when no key is set.
GEMINI_KEY_SET = bool(os.environ.get("GEMINI_API_KEY"))


def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default=DEFAULT_BASE_URL,
        help="Base URL of the backend under test (default: %(default)s)",
    )


@pytest.fixture(scope="session")
def base_url(pytestconfig):
    url = pytestconfig.getoption("--base-url")
    try:
        r = requests.get(f"{url}/api/health", timeout=5)
        r.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - failure path
        raise RuntimeError(
            f"Contract suite target {url} is not reachable.\n"
            "Start the backend first: 'npm run dev' (Express on :3000), or after the "
            "migration 'uvicorn backend.app.main:app --port 8000'. "
            f"To point elsewhere: --base-url <url> or API_BASE_URL env var.\nCause: {exc}"
        ) from exc
    return url


# Session JWT, minted once against the FastAPI backend (None on Express, which
# has no login endpoint — its suite run stays header-based).
_SESSION_TOKEN = None


def mint_token(base_url: str, role: str) -> str:
    """Mint a JWT for a demo role (FastAPI backend)."""
    r = requests.post(
        f"{base_url}/api/auth/demo-login",
        json={"role": role},
        timeout=10,
    )
    assert r.status_code == 200, f"demo-login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_token(base_url):
    global _SESSION_TOKEN
    try:
        r = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": "superadmin@civic.com", "password": "superadmin123"},
            timeout=5,
        )
        _SESSION_TOKEN = r.json().get("token") if r.status_code == 200 else None
    except requests.RequestException:
        _SESSION_TOKEN = None
    return _SESSION_TOKEN


class ApiClient:
    """Thin requests wrapper injecting x-user-role and (when available) the session JWT."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def request(self, method, path, role="citizen", use_token=True, **kwargs):
        headers = dict(kwargs.pop("headers", {}))
        headers.setdefault("x-user-role", role)
        if use_token and _SESSION_TOKEN and "Authorization" not in headers:
            headers["Authorization"] = f"Bearer {_SESSION_TOKEN}"
        return requests.request(
            method, f"{self.base_url}{path}", headers=headers, timeout=10, **kwargs
        )

    def get(self, path, role="citizen", **kw):
        return self.request("GET", path, role, **kw)

    def post(self, path, role="citizen", **kw):
        return self.request("POST", path, role, **kw)

    def patch(self, path, role="citizen", **kw):
        return self.request("PATCH", path, role, **kw)


@pytest.fixture
def api(base_url, auth_token):
    return ApiClient(base_url)


@pytest.fixture(autouse=True)
def _pristine_seed(api):
    """Reset all three in-memory DBs before every test."""
    r = api.post("/api/seed-reset", role="super_admin")
    assert r.status_code == 200, f"seed-reset failed: {r.status_code} {r.text}"
    yield


# ---------------------------------------------------------------------------
# Shared assertions / seed facts
# ---------------------------------------------------------------------------

# Seed inventory (mirrors src/data/seedData.ts + categoriesData.ts)
SEED_COMPLAINT_COUNT = 9
SEED_CATEGORY_COUNT = 6
SEED_TRACKING_IDS = [f"CIV-2026-{n}" for n in range(8091, 8100)]
ROADS_CATEGORY = "Roads & Potholes"


def assert_complaint_shape(c: dict):
    for key in (
        "id", "trackingId", "title", "description", "citizenName", "citizenContact",
        "location", "category", "assignedDepartment", "priority", "priorityScore",
        "priorityReasoning", "status", "summary", "recommendedActions",
        "estimatedSLAHours", "detectedKeywords", "createdAt", "updatedAt",
    ):
        assert key in c, f"complaint missing field {key!r}: {sorted(c)}"
    # Pakistan structured location is mandatory on every record
    loc = c["location"]
    assert isinstance(loc, dict) and loc.get("address"), f"location missing address: {loc}"
    assert loc.get("provinceId") == "sindh", f"location missing provinceId=sindh: {loc}"


def assert_category_shape(c: dict):
    for key in (
        "id", "name", "description", "department", "defaultPriority",
        "defaultSLAHours", "status", "subcategories", "createdAt", "updatedAt",
    ):
        assert key in c, f"category missing field {key!r}: {sorted(c)}"
    assert isinstance(c["subcategories"], list)


def assert_audit_entry_shape(e: dict):
    for key in ("id", "user", "role", "action", "timestamp"):
        assert key in e, f"audit entry missing field {key!r}: {sorted(e)}"


def assert_sorted_newest_first(complaints: list):
    times = [c["createdAt"] for c in complaints]
    assert times == sorted(times, reverse=True), "complaints not sorted newest-first"


TRACKING_RE = re.compile(r"^CIV-2026-\d{4}$")
