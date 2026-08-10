from conftest import (
    SEED_COMPLAINT_COUNT,
    TRACKING_RE,
    assert_audit_entry_shape,
    assert_complaint_shape,
)

VALID_COMPLAINT = {
    "title": "Contract test complaint",
    "description": "Test complaint description with pothole details",
    "citizenName": "Test Citizen",
    "citizenContact": "+92 300 0000000",
}


def test_create_complaint_validation(api):
    r = api.post("/api/complaints", role="citizen", json={"description": "no name"})
    assert r.status_code == 400
    assert "Missing required fields" in r.json()["error"]

    r = api.post("/api/complaints", role="citizen", json={"citizenName": "no desc"})
    assert r.status_code == 400


def test_create_complaint_full_flow(api):
    r = api.post("/api/complaints", role="citizen", json=VALID_COMPLAINT)
    assert r.status_code == 201
    c = r.json()
    assert_complaint_shape(c)
    assert TRACKING_RE.match(c["trackingId"])
    assert c["status"] == "Submitted"
    assert c["category"] == "Other"                       # default analysis fallback
    assert c["assignedDepartment"] == "General Municipal Services"
    # Karachi default demo location (no lat/long required by the API)
    assert c["location"]["provinceId"] == "sindh"
    assert c["location"]["districtId"] == "karachi-south"
    assert c["location"]["address"]

    # persisted, sorted newest-first, audit trail
    rows = api.get("/api/complaints", role="super_admin").json()
    assert len(rows) == SEED_COMPLAINT_COUNT + 1
    assert rows[0]["trackingId"] == c["trackingId"]

    logs = api.get("/api/audit-logs", role="super_admin").json()
    head = logs[0]
    assert_audit_entry_shape(head)
    assert head["action"] == "Submitted Civic Complaint"
    assert head["ticketId"] == c["trackingId"]
    assert head["role"] == "citizen"


def test_patch_complaint_not_found(api):
    r = api.patch("/api/complaints/nope", role="supervisor", json={"status": "In Progress"})
    assert r.status_code == 404


def test_patch_status_and_resolution_date_quirk(api):
    # 8096 starts as Submitted without a resolution date
    before = api.get("/api/complaints/CIV-2026-8096", role="supervisor").json()
    assert before["status"] == "Submitted"
    assert not before.get("resolutionDate")

    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        role="supervisor",
        json={"status": "Resolved", "resolutionNotes": "Fixed by crew"},
    )
    assert r.status_code == 200
    resolved = r.json()
    assert resolved["status"] == "Resolved"
    assert resolved["resolutionDate"], "resolutionDate must be set on transition to Resolved"
    assert resolved["resolutionNotes"] == "Fixed by crew"
    first_date = resolved["resolutionDate"]

    # Moving away from Resolved must NOT wipe the date
    r = api.patch("/api/complaints/CIV-2026-8096", role="supervisor", json={"status": "In Progress"})
    moved = r.json()
    assert moved["status"] == "In Progress"
    assert moved["resolutionDate"] == first_date


def test_patch_clears_assigned_officer_with_null(api):
    before = api.get("/api/complaints/CIV-2026-8092", role="supervisor").json()
    assert before["assignedOfficer"] == "Officer Imran Shahid"

    r = api.patch("/api/complaints/CIV-2026-8092", role="supervisor", json={"assignedOfficer": None})
    assert r.status_code == 200
    assert r.json()["assignedOfficer"] is None

    # and it is reflected in officer scoping: 8092 is now unassigned,
    # Imran Shahid keeps his other two assignments
    rows = api.get(
        "/api/complaints", role="field_officer", params={"officer": "Officer Imran Shahid"}
    ).json()
    cleared = next(c for c in rows if c["trackingId"] == "CIV-2026-8092")
    assert not cleared.get("assignedOfficer")
    assert sum(1 for c in rows if c.get("assignedOfficer") == "Officer Imran Shahid") == 2


def test_patch_category_override_audits(api):
    r = api.patch(
        "/api/complaints/CIV-2026-8096",
        role="supervisor",
        json={
            "category": "Electricity",
            "subcategory": "Electrical Hazard",
            "supervisorOverride": {"reason": "Contract test override"},
        },
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["category"] == "Electricity"
    assert updated["subcategory"] == "Electrical Hazard"

    logs = api.get("/api/audit-logs", role="super_admin").json()
    head = logs[0]
    assert_audit_entry_shape(head)
    assert head["action"] == "Supervisor Category Override"
    assert "Parks & Greenery" in head["oldValue"]
    assert "Electricity" in head["newValue"]
    # FastAPI attributes the actor from the JWT (super_admin session token);
    # Express attributes it from the x-user-role header (supervisor).
    assert head["role"] in ("supervisor", "super_admin")


def test_patch_assigns_officer(api):
    r = api.patch(
        "/api/complaints/CIV-2026-8093",
        role="supervisor",
        json={"assignedOfficer": "Officer Bilal Ahmed", "status": "Assigned"},
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["assignedOfficer"] == "Officer Bilal Ahmed"
    assert updated["status"] == "Assigned"
