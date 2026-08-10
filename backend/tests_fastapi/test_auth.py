"""FastAPI-only tests: JWT authentication and the hardened endpoint gates.

The legacy Express backend has no /api/auth/* endpoints, so these tests live in
the FastAPI suite. Run with:
    .venv/Scripts/python.exe -m pytest backend/tests_fastapi --base-url http://127.0.0.1:8000 -q
"""
import jwt

from conftest import mint_token


def _bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Login / demo-login
# ---------------------------------------------------------------------------

def test_login_success(api):
    r = api.post(
        "/api/auth/login",
        json={"email": "superadmin@civic.com", "password": "superadmin123"},
        use_token=False,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["token"]
    payload = jwt.decode(data["token"], options={"verify_signature": False})
    assert payload["role"] == "super_admin"
    assert data["user"]["email"] == "superadmin@civic.com"


def test_login_wrong_password(api):
    r = api.post(
        "/api/auth/login",
        json={"email": "citizen@civic.com", "password": "wrong"},
        use_token=False,
    )
    assert r.status_code == 401


def test_login_unknown_email(api):
    r = api.post(
        "/api/auth/login",
        json={"email": "nobody@civic.com", "password": "whatever"},
        use_token=False,
    )
    assert r.status_code == 401


def test_login_case_insensitive_email(api):
    r = api.post(
        "/api/auth/login",
        json={"email": "CITIZEN@CIVIC.COM", "password": "citizen123"},
        use_token=False,
    )
    assert r.status_code == 200


def test_demo_login_mints_role_token(api):
    for role in ("citizen", "field_officer", "supervisor", "municipal_admin", "super_admin"):
        token = mint_token(api.base_url, role)
        payload = jwt.decode(token, options={"verify_signature": False})
        assert payload["role"] == role, role


# ---------------------------------------------------------------------------
# Hardened gates: GET /api/audit-logs
# ---------------------------------------------------------------------------

def test_audit_logs_require_token(api):
    r = api.get("/api/audit-logs", role="super_admin", use_token=False)
    assert r.status_code == 401


def test_audit_logs_denied_for_citizen_token(api):
    token = mint_token(api.base_url, "citizen")
    r = api.get("/api/audit-logs", role="citizen", headers=_bearer(token))
    assert r.status_code == 403


def test_audit_logs_allowed_for_admin_token(api):
    token = mint_token(api.base_url, "municipal_admin")
    r = api.get("/api/audit-logs", role="municipal_admin", headers=_bearer(token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------------------------------------------------------------------
# Hardened gates: GET /api/complaints/{id}
# ---------------------------------------------------------------------------

def test_complaint_detail_requires_token(api):
    r = api.get("/api/complaints/CIV-2026-8091", role="citizen", use_token=False)
    assert r.status_code == 401


def test_complaint_detail_allowed_for_any_authenticated_role(api):
    token = mint_token(api.base_url, "citizen")
    r = api.get("/api/complaints/CIV-2026-8091", role="citizen", headers=_bearer(token))
    assert r.status_code == 200


def test_complaint_detail_rejects_bad_token(api):
    r = api.get(
        "/api/complaints/CIV-2026-8091",
        role="citizen",
        headers=_bearer("not-a-real-jwt"),
    )
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# Hardened gates: PATCH /api/complaints/{id}
# ---------------------------------------------------------------------------

def test_patch_complaint_requires_token(api):
    r = api.patch("/api/complaints/CIV-2026-8096", json={"status": "Assigned"}, use_token=False)
    assert r.status_code == 401


def test_patch_complaint_denied_for_citizen_token(api):
    token = mint_token(api.base_url, "citizen")
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        json={"status": "Assigned"},
        headers=_bearer(token),
    )
    assert r.status_code == 403


def test_patch_complaint_allowed_for_officer_token(api):
    token = mint_token(api.base_url, "field_officer")
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        json={"status": "In Progress", "assignedOfficer": "Officer Imran Shahid"},
        headers=_bearer(token),
    )
    assert r.status_code == 200
    assert r.json()["status"] == "In Progress"
    # change is persisted
    detail = api.get("/api/complaints/CIV-2026-8096").json()
    assert detail["status"] == "In Progress"


def test_patch_override_audit_uses_token_role(api):
    """The category-override audit entry attributes the authenticated token role."""
    token = mint_token(api.base_url, "supervisor")
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        json={
            "category": "Electricity",
            "subcategory": "Electrical Hazard",
            "supervisorOverride": {"reason": "auth test"},
        },
        headers=_bearer(token),
    )
    assert r.status_code == 200
    logs = api.get("/api/audit-logs", role="super_admin").json()
    head = logs[0]
    assert head["action"] == "Supervisor Category Override"
    assert head["role"] == "supervisor"
