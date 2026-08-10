from conftest import SEED_CATEGORY_COUNT, SEED_COMPLAINT_COUNT


def test_seed_reset_restores_everything(api):
    # Mutate state
    api.post(
        "/api/complaints",
        role="citizen",
        json={
            "title": "temp",
            "description": "temp complaint to be wiped",
            "citizenName": "Temp User",
        },
    )
    assert len(api.get("/api/complaints", role="super_admin").json()) == SEED_COMPLAINT_COUNT + 1

    r = api.post("/api/seed-reset", role="super_admin")
    assert r.status_code == 200
    assert r.json()["message"] == "Database reset to default seed data"
    assert r.json()["count"] == SEED_COMPLAINT_COUNT

    assert len(api.get("/api/complaints", role="super_admin").json()) == SEED_COMPLAINT_COUNT
    assert len(api.get("/api/categories", role="super_admin").json()) == SEED_CATEGORY_COUNT


def test_seed_reset_is_idempotent(api):
    first = api.get("/api/audit-logs", role="super_admin").json()
    api.post("/api/seed-reset", role="super_admin")
    second = api.get("/api/audit-logs", role="super_admin").json()
    assert first == second


def test_audit_logs_list(api):
    r = api.get("/api/audit-logs", role="super_admin")
    assert r.status_code == 200
    logs = r.json()
    assert isinstance(logs, list) and logs
    for e in logs:
        assert e["role"] in {"citizen", "field_officer", "supervisor", "municipal_admin", "super_admin"}
