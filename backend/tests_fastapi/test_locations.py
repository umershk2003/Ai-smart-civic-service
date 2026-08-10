"""FastAPI-only tests (Phase 7): the Pakistan location hierarchy endpoints.

These endpoints have no Express counterpart, so they live outside the shared
parity suite. Run against the FastAPI backend:

    .venv/Scripts/python.exe -m pytest backend/tests_fastapi --base-url http://127.0.0.1:8000 -q
"""


def test_provinces(api):
    rows = api.get("/api/locations/provinces", role="super_admin").json()
    names = {r["name"] for r in rows}
    assert "Sindh" in names and "Punjab" in names and "Khyber Pakhtunkhwa" in names


def test_divisions_filtered_by_province(api):
    rows = api.get(
        "/api/locations/divisions", role="super_admin", params={"province_id": "sindh"}
    ).json()
    ids = {r["id"] for r in rows}
    assert "karachi-division" in ids
    assert all(r["provinceId"] == "sindh" for r in rows)


def test_districts_filtered_by_division(api):
    rows = api.get(
        "/api/locations/districts", role="super_admin", params={"division_id": "karachi-division"}
    ).json()
    assert "karachi-south" in {r["id"] for r in rows}
    assert "karachi-east" in {r["id"] for r in rows}


def test_tehsils_filtered_by_district(api):
    rows = api.get(
        "/api/locations/tehsils", role="super_admin", params={"district_id": "karachi-south"}
    ).json()
    assert {"saddar", "clifton", "lyari"} <= {r["id"] for r in rows}


def test_municipalities_filtered_by_tehsil(api):
    rows = api.get(
        "/api/locations/municipalities", role="super_admin", params={"tehsil_id": "clifton"}
    ).json()
    assert "karachi-mc-clifton" in {r["id"] for r in rows}


def test_wards_filtered_by_municipality(api):
    rows = api.get(
        "/api/locations/wards", role="super_admin", params={"municipality_id": "karachi-mc"}
    ).json()
    ids = {r["id"] for r in rows}
    assert "karachi-w1" in ids and "karachi-w3" in ids


def test_areas_filtered_by_ward(api):
    rows = api.get(
        "/api/locations/areas", role="super_admin", params={"ward_id": "karachi-w6"}
    ).json()
    assert "Gulshan-e-Iqbal Block 6" in {r["name"] for r in rows}


def test_hierarchy_matches_seed_complaint_locations(api):
    """Every complaint's ward must exist in the ward registry."""
    complaints = api.get("/api/complaints", role="super_admin").json()
    wards = api.get("/api/locations/wards", role="super_admin").json()
    ward_ids = {w["id"] for w in wards}
    for c in complaints:
        assert c["location"]["wardId"] in ward_ids, c["trackingId"]
