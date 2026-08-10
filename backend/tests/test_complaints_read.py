from conftest import (
    SEED_COMPLAINT_COUNT,
    assert_complaint_shape,
    assert_sorted_newest_first,
)

CIVILIAN_ROLES = ["citizen", "field_officer", "supervisor", "municipal_admin", "super_admin"]


def test_list_all_complaints(api):
    r = api.get("/api/complaints", role="super_admin")
    assert r.status_code == 200
    complaints = r.json()
    assert len(complaints) == SEED_COMPLAINT_COUNT
    assert_sorted_newest_first(complaints)
    for c in complaints:
        assert_complaint_shape(c)
        assert c["trackingId"] in {f"CIV-2026-{n}" for n in range(8091, 8100)}


def test_list_all_roles_see_full_seed(api):
    # Without query params the endpoint returns everything for every role.
    for role in CIVILIAN_ROLES:
        r = api.get("/api/complaints", role=role)
        assert r.status_code == 200
        assert len(r.json()) == SEED_COMPLAINT_COUNT, f"role {role} scoped unexpectedly"


def test_field_officer_officer_scoping(api):
    # field_officer + officer param -> officer's own + all unassigned
    r = api.get(
        "/api/complaints",
        role="field_officer",
        params={"officer": "Officer Imran Shahid"},
    )
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 5    # 3 assigned to Imran Shahid + 2 unassigned
    for c in rows:
        # unassigned seed records omit the key entirely (undefined -> no JSON key)
        assert c.get("assignedOfficer") == "Officer Imran Shahid" or not c.get("assignedOfficer")


def test_supervisor_department_scoping(api):
    r = api.get(
        "/api/complaints",
        role="supervisor",
        params={"department": "Department of Public Works"},
    )
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 3
    assert all(c["assignedDepartment"] == "Department of Public Works" for c in rows)


def test_category_filter(api):
    r = api.get("/api/complaints", role="super_admin", params={"category": "Roads & Potholes"})
    rows = r.json()
    assert len(rows) == 3
    assert all(c["category"] == "Roads & Potholes" for c in rows)


def test_priority_filter(api):
    r = api.get("/api/complaints", role="super_admin", params={"priority": "Critical"})
    rows = r.json()
    assert len(rows) == 3
    assert all(c["priority"] == "Critical" for c in rows)


def test_status_filter(api):
    r = api.get("/api/complaints", role="super_admin", params={"status": "In Progress"})
    rows = r.json()
    assert len(rows) == 3
    assert all(c["status"] == "In Progress" for c in rows)


def test_ward_filter(api):
    r = api.get(
        "/api/complaints",
        role="super_admin",
        params={"ward": "Ward 6 – Gulshan-e-Iqbal"},
    )
    rows = r.json()
    assert len(rows) == 2
    assert all(c["location"]["ward"] == "Ward 6 – Gulshan-e-Iqbal" for c in rows)


def test_department_filter(api):
    # only CIV-2026-8091 is Water & Sanitation Authority (8095 is Urban Drainage Division)
    r = api.get(
        "/api/complaints",
        role="super_admin",
        params={"department": "Water & Sanitation Authority"},
    )
    rows = r.json()
    assert len(rows) == 1
    assert all(c["assignedDepartment"] == "Water & Sanitation Authority" for c in rows)

    r = api.get(
        "/api/complaints",
        role="super_admin",
        params={"department": "Urban Drainage Division"},
    )
    assert len(r.json()) == 1


def test_search_matches_multiple_fields(api):
    # by title keyword
    assert len(api.get("/api/complaints", role="super_admin", params={"search": "sinkhole"}).json()) == 1
    # by tracking id
    assert len(api.get("/api/complaints", role="super_admin", params={"search": "CIV-2026-8091"}).json()) == 1
    # by address
    assert len(api.get("/api/complaints", role="super_admin", params={"search": "NIPA"}).json()) == 1
    # case-insensitive
    assert len(api.get("/api/complaints", role="super_admin", params={"search": "SINKHOLE"}).json()) == 1


def test_filter_combined_with_search(api):
    # note: search also matches the category name, so 'pothole' hits all
    # "Roads & Potholes" rows; use a word that only appears in one complaint.
    r = api.get(
        "/api/complaints",
        role="super_admin",
        params={"category": "Roads & Potholes", "search": "sinkhole"},
    )
    rows = r.json()
    assert len(rows) == 1  # CIV-2026-8098 only
    assert rows[0]["trackingId"] == "CIV-2026-8098"


def test_get_single_by_tracking_id_case_insensitive(api):
    r = api.get("/api/complaints/civ-2026-8091", role="citizen")
    assert r.status_code == 200
    assert r.json()["trackingId"] == "CIV-2026-8091"


def test_get_single_by_internal_id(api):
    r = api.get("/api/complaints/cmp-002", role="citizen")
    assert r.status_code == 200
    assert r.json()["id"] == "cmp-002"


def test_get_single_not_found(api):
    r = api.get("/api/complaints/nope-123", role="citizen")
    assert r.status_code == 404
    assert "not found" in r.json()["error"].lower()


def test_pakistan_location_system_present(api):
    r = api.get("/api/complaints", role="super_admin")
    for c in r.json():
        loc = c["location"]
        # structured hierarchy IDs are the backbone; no map/GIS coordinates required
        assert loc.get("provinceId") == "sindh"
        assert loc.get("divisionId") == "karachi-division"
        assert loc.get("wardId")
        assert loc.get("address")
