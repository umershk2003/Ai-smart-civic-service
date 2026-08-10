def test_health_ok(api):
    r = api.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert isinstance(data.get("timestamp"), str) and data["timestamp"]
