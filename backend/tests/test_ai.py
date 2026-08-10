import pytest

from conftest import GEMINI_KEY_SET

AI_SHAPE_KEYS = {
    "category", "assignedDepartment", "priority", "priorityScore", "priorityReasoning",
    "summary", "recommendedActions", "estimatedSLAHours", "detectedKeywords",
    "confidence", "needsHumanReview",
}


@pytest.mark.skipif(GEMINI_KEY_SET, reason="Live Gemini responses vary; strict mapping only without an API key")
class TestAnalyzeComplaintFallback:
    def test_requires_text(self, api):
        r = api.post("/api/analyze-complaint", role="citizen", json={})
        assert r.status_code == 400
        r = api.post("/api/analyze-complaint", role="citizen", json={"complaintText": "   "})
        assert r.status_code == 400

    def test_road_keywords(self, api):
        r = api.post(
            "/api/analyze-complaint",
            role="citizen",
            json={"complaintText": "A big pothole on the main road near the market"},
        )
        assert r.status_code == 200
        data = r.json()
        assert AI_SHAPE_KEYS <= set(data)
        assert data["category"] == "Roads & Potholes"
        assert data["assignedDepartment"] == "Department of Public Works"
        assert data["priority"] == "Medium"
        assert data["estimatedSLAHours"] == 24
        assert data["confidence"] == 85

    def test_water_keywords_critical(self, api):
        r = api.post(
            "/api/analyze-complaint",
            role="citizen",
            json={"complaintText": "water pipe burst flooding the whole street"},
        )
        data = r.json()
        assert data["category"] == "Water Supply & Leakage"
        assert data["assignedDepartment"] == "Water & Sanitation Authority"
        assert data["priority"] == "Critical"
        assert data["estimatedSLAHours"] == 12
        assert data["needsHumanReview"] is True

    def test_electricity_keywords(self, api):
        r = api.post(
            "/api/analyze-complaint",
            role="citizen",
            json={"complaintText": "sparking transformer wire near the school"},
        )
        data = r.json()
        assert data["category"] == "Electricity & Streetlights"
        assert data["priority"] == "Critical"

    def test_unknown_text_defaults(self, api):
        r = api.post(
            "/api/analyze-complaint",
            role="citizen",
            json={"complaintText": "something completely unrelated to civic services"},
        )
        data = r.json()
        assert data["category"] == "Other"
        assert data["assignedDepartment"] == "General Municipal Services"
        assert data["priority"] == "Medium"


def test_analyze_complaint_shape_with_or_without_key(api):
    """Shape guarantee must hold regardless of Gemini availability."""
    r = api.post(
        "/api/analyze-complaint",
        role="citizen",
        json={"complaintText": "pothole on the road"},
    )
    assert r.status_code == 200
    data = r.json()
    assert AI_SHAPE_KEYS <= set(data)
    assert data["priority"] in {"Low", "Medium", "High", "Critical"}
    assert 1 <= data["priorityScore"] <= 100
    assert isinstance(data["recommendedActions"], list) and data["recommendedActions"]
    assert isinstance(data["detectedKeywords"], list)


def test_chat_assistant_validation(api):
    r = api.post("/api/chat-assistant", role="citizen", json={})
    assert r.status_code == 400


def test_chat_assistant_reply(api):
    r = api.post("/api/chat-assistant", role="citizen", json={"message": "hello"})
    assert r.status_code == 200
    assert isinstance(r.json()["reply"], str) and r.json()["reply"].strip()


@pytest.mark.skipif(GEMINI_KEY_SET, reason="Canned stats reply only without an API key")
def test_chat_assistant_canned_reply_mentions_stats(api):
    r = api.post("/api/chat-assistant", role="citizen", json={"message": "hello"})
    assert "total complaints" in r.json()["reply"]
