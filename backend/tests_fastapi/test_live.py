"""FastAPI-only tests: the real-time layer.

Covers the persisted, role-scoped notification feed (GET /api/notifications,
POST /api/notifications/read) and the SLA breach escalator end-to-end: the
overdue seed ticket CIV-2026-8099 must produce exactly one critical
notification for staff roles, hidden from citizens, after seed-reset triggers
an immediate scan.

Run with:
    .venv/Scripts/python.exe -m pytest backend/tests_fastapi --base-url http://127.0.0.1:8000 -q
"""
import time

from conftest import mint_token

BREACH_TICKET = "CIV-2026-8099"
BREACH_ROLES = ("supervisor", "municipal_admin", "super_admin", "field_officer")


def _bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _wait_for_breach(api, role: str, timeout: float = 15.0) -> dict:
    """Poll for the SLA-breach notification (fired asynchronously by seed-reset)."""
    token = mint_token(api.base_url, role)
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = api.get("/api/notifications", role=role, headers=_bearer(token))
        assert r.status_code == 200
        notifs = r.json()["notifications"]
        breach = [n for n in notifs if n.get("action") == "sla_breach"]
        if breach:
            return breach[0]
        time.sleep(0.5)
    raise AssertionError(f"SLA breach notification for {BREACH_TICKET} never appeared")


# ---------------------------------------------------------------------------
# Auth on the notification feed
# ---------------------------------------------------------------------------

def test_notifications_require_token(api):
    r = api.get("/api/notifications", role="supervisor", use_token=False)
    assert r.status_code == 401


def test_notifications_reject_bad_token(api):
    r = api.get("/api/notifications", role="supervisor", headers=_bearer("garbage"))
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# SLA breach escalator (end-to-end through the live background scan)
# ---------------------------------------------------------------------------

def test_sla_breach_notifies_staff_roles_only(api):
    """After seed-reset, the overdue ticket escalates once to each staff role."""
    # Seed-reset is the autouse fixture; the immediate scan already ran.
    for role in BREACH_ROLES:
        n = _wait_for_breach(api, role)
        assert n["ticketId"] == BREACH_TICKET
        assert n["tone"] == "critical"
        assert n["read"] is False
        assert "SLA" in n["title"]
        assert n["tab"] == "desk"

    # Citizens never see the staff breach notification.
    token = mint_token(api.base_url, "citizen")
    r = api.get("/api/notifications", role="citizen", headers=_bearer(token))
    assert r.status_code == 200
    assert all(n.get("action") != "sla_breach" for n in r.json()["notifications"])


def test_sla_breach_is_deduplicated(api):
    """A second scan pass must not duplicate the notification."""
    first = _wait_for_breach(api, "supervisor")
    time.sleep(2.5)  # let a second background scan pass elapse
    token = mint_token(api.base_url, "supervisor")
    notifs = api.get("/api/notifications", role="supervisor", headers=_bearer(token)).json()["notifications"]
    breaches = [n for n in notifs if n.get("action") == "sla_breach"]
    assert len(breaches) == 1, f"expected dedupe, got {len(breaches)} breach notifications"
    assert breaches[0]["id"] == first["id"]


# ---------------------------------------------------------------------------
# Mark-all-read
# ---------------------------------------------------------------------------

def test_mark_all_read(api):
    n = _wait_for_breach(api, "supervisor")
    assert n["read"] is False

    token = mint_token(api.base_url, "supervisor")
    r = api.post("/api/notifications/read", role="supervisor", headers=_bearer(token))
    assert r.status_code == 200
    assert r.json()["unreadCount"] == 0

    # Read state persists across requests.
    notifs = api.get("/api/notifications", role="supervisor", headers=_bearer(token)).json()
    assert notifs["unreadCount"] == 0
    assert all(x["read"] for x in notifs["notifications"])


def test_mark_all_read_scoped_to_role(api):
    """Marking read as supervisor must not clear the breach for other roles."""
    _wait_for_breach(api, "supervisor")
    token = mint_token(api.base_url, "supervisor")
    api.post("/api/notifications/read", role="supervisor", headers=_bearer(token))

    admin = mint_token(api.base_url, "municipal_admin")
    notifs = api.get("/api/notifications", role="municipal_admin", headers=_bearer(admin)).json()
    assert notifs["unreadCount"] >= 1
    assert any(n.get("action") == "sla_breach" and not n["read"] for n in notifs["notifications"])
