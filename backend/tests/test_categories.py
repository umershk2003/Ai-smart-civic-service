from conftest import SEED_CATEGORY_COUNT, assert_audit_entry_shape, assert_category_shape

UNAUTHORIZED_ROLES = ["citizen", "field_officer", "supervisor"]


def test_list_categories(api):
    r = api.get("/api/categories", role="citizen")
    assert r.status_code == 200
    cats = r.json()
    assert len(cats) == SEED_CATEGORY_COUNT
    for c in cats:
        assert_category_shape(c)
    names = {c["name"] for c in cats}
    assert {
        "Water & Leakage", "Roads & Potholes", "Waste Management",
        "Electricity", "Drainage", "Parks & Greenery",
    } == names


def test_create_category_denied_for_non_admins(api):
    for role in UNAUTHORIZED_ROLES:
        r = api.post(
            "/api/categories",
            role=role,
            json={
                "name": "Public Safety",
                "description": "Emergency response",
                "department": "Public Safety & Emergency Operations",
            },
        )
        assert r.status_code == 403, f"{role} should get 403, got {r.status_code}"
        assert "Permission denied" in r.json()["error"]


def test_create_category_missing_fields(api):
    r = api.post("/api/categories", role="municipal_admin", json={"name": "Only name"})
    assert r.status_code == 400
    assert "Missing required fields" in r.json()["error"]


def test_create_category_as_municipal_admin(api):
    r = api.post(
        "/api/categories",
        role="municipal_admin",
        json={
            "name": "Public Safety",
            "description": "Emergency response",
            "department": "Public Safety & Emergency Operations",
            "defaultPriority": "Critical",
            "defaultSLAHours": 6,
            "subcategories": ["Fire Hazard", "Flood Rescue"],
        },
    )
    assert r.status_code == 201
    new_cat = r.json()
    assert new_cat["name"] == "Public Safety"
    assert new_cat["status"] == "Active"          # default
    assert new_cat["defaultPriority"] == "Critical"
    assert new_cat["subcategories"] == ["Fire Hazard", "Flood Rescue"]
    assert_category_shape(new_cat)

    # persisted + audit trail
    assert len(api.get("/api/categories", role="super_admin").json()) == SEED_CATEGORY_COUNT + 1
    logs = api.get("/api/audit-logs", role="super_admin").json()
    head = logs[0]
    assert_audit_entry_shape(head)
    assert head["action"] == "Created Complaint Category"
    assert head["role"] == "municipal_admin"
    assert head["newValue"] == "Public Safety"


def test_patch_category_denied_for_non_admins(api):
    for role in UNAUTHORIZED_ROLES:
        r = api.patch("/api/categories/cat-2", role=role, json={"description": "x"})
        assert r.status_code == 403, f"{role} should get 403, got {r.status_code}"


def test_patch_category_not_found(api):
    r = api.patch(
        "/api/categories/nope", role="municipal_admin", json={"description": "x"}
    )
    assert r.status_code == 404
    assert "not found" in r.json()["error"].lower()


def test_patch_category_updates_and_audits(api):
    original = api.get("/api/categories", role="super_admin").json()
    cat2 = next(c for c in original if c["id"] == "cat-2")

    r = api.patch(
        "/api/categories/cat-2",
        role="municipal_admin",
        json={"description": "Updated description", "defaultSLAHours": 72},
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["id"] == "cat-2"
    assert updated["description"] == "Updated description"
    assert updated["defaultSLAHours"] == 72
    assert updated["updatedAt"] != cat2["updatedAt"]

    logs = api.get("/api/audit-logs", role="super_admin").json()
    head = logs[0]
    assert head["action"] == "Updated Complaint Category Specs"
    assert head["oldValue"] == cat2["name"]
