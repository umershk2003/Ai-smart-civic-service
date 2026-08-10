"""FastAPI-only: the immutable audit ledger records every real transition.

The Express rollback only audits category overrides; FastAPI additionally logs
status, priority, and officer-assignment changes with the authenticated actor.
These are FastAPI-only behaviors, so they live outside the shared parity suite.
"""
from conftest import mint_token, assert_audit_entry_shape


def _bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _latest_actions(api, n: int = 6) -> list[dict]:
    logs = api.get("/api/audit-logs", role="super_admin").json()
    return logs[:n]


def test_status_transition_is_audited_with_jwt_actor(api):
    token = mint_token(api.base_url, "field_officer")
    r = api.patch(
        "/api/complaints/CIV-2026-8093",
        json={"status": "In Progress"},
        headers=_bearer(token),
    )
    assert r.status_code == 200

    head = _latest_actions(api)[0]
    assert_audit_entry_shape(head)
    assert head["action"] == "Status Update"
    assert head["ticketId"] == "CIV-2026-8093"
    assert head["oldValue"] == "Under Review"
    assert head["newValue"] == "In Progress"
    # Actor comes from the token, not the spoofable header.
    assert head["role"] == "field_officer"
    assert head["user"] == "Officer Imran Shahid"


def test_priority_change_is_audited(api):
    token = mint_token(api.base_url, "supervisor")
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        json={"priority": "Critical"},
        headers=_bearer(token),
    )
    assert r.status_code == 200
    head = _latest_actions(api)[0]
    assert head["action"] == "Priority Change"
    assert head["newValue"] == "Critical"
    assert head["role"] == "supervisor"


def test_officer_assignment_and_unassignment_are_audited(api):
    token = mint_token(api.base_url, "supervisor")
    r = api.patch(
        "/api/complaints/CIV-2026-8093",
        json={"assignedOfficer": "Officer Bilal Ahmed", "status": "Assigned"},
        headers=_bearer(token),
    )
    assert r.status_code == 200
    actions = _latest_actions(api)[:3]
    labels = {a["action"] for a in actions}
    assert {"Status Update", "Officer Assigned"} <= labels

    r = api.patch(
        "/api/complaints/CIV-2026-8093",
        json={"assignedOfficer": None},
        headers=_bearer(token),
    )
    assert r.status_code == 200
    head = _latest_actions(api)[0]
    assert head["action"] == "Officer Unassigned"
    assert head["oldValue"] == "Officer Bilal Ahmed"
    assert head["newValue"] == "Unassigned"


def test_no_duplicate_audit_when_nothing_changes(api):
    token = mint_token(api.base_url, "supervisor")
    before = len(_latest_actions(api, 50))
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        json={"status": "Submitted"},  # 8096 is already Submitted
        headers=_bearer(token),
    )
    assert r.status_code == 200
    after = len(_latest_actions(api, 50))
    assert after == before, "no-op patch must not create audit entries"
