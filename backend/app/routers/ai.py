import json
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db import db

router = APIRouter(tags=["ai"])

GEMINI_MODEL = "gemini-3.6-flash"


def get_gemini_client():
    """None when no usable API key -> handlers fall back to rule-based replies."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "MY_GEMINI_API_KEY":
        return None
    from google.genai import Client, types

    return Client(
        api_key=api_key,
        http_options=types.HttpOptions(headers={"User-Agent": "aistudio-build"}),
    )


def generate_fallback_analysis(complaint_text: str, image_base64: Optional[str] = None) -> dict:
    """Keyword rule engine, ported verbatim from server.ts's generateFallbackAnalysis."""
    text = complaint_text.lower()
    category = "Other"
    assigned_department = "General Municipal Services"
    priority = "Medium"
    priority_score = 50
    estimated_sla_hours = 48
    reasoning = (
        "General municipal service request with no matching civic category; "
        "assigned Medium priority with a 48h SLA."
    )

    def hits(words):
        return [w for w in words if w in text]

    if any(k in text for k in ("pothole", "road", "asphalt", "pavement")):
        category = "Roads & Potholes"
        assigned_department = "Department of Public Works"
        priority = "High" if ("accident" in text or "deep" in text) else "Medium"
        priority_score = 80 if priority == "High" else 50
        estimated_sla_hours = 24
        kw = hits(["pothole", "road", "asphalt", "pavement"])
        reasoning = (
            f"Complaint mentions {', '.join(kw)} — a road-safety hazard with accident or "
            "deep-damage indicators, escalated to High priority for dispatch within the 24h SLA."
            if priority == "High"
            else f"Complaint mentions {', '.join(kw)} — road surface damage assigned Medium priority with a 24h SLA."
        )
    elif any(k in text for k in ("water", "pipe", "leak", "gush")):
        category = "Water Supply & Leakage"
        assigned_department = "Water & Sanitation Authority"
        priority = "Critical" if ("burst" in text or "flooding" in text) else "High"
        priority_score = 95 if priority == "Critical" else 75
        estimated_sla_hours = 12
        kw = hits(["water", "pipe", "leak", "gush"])
        reasoning = (
            f"Complaint mentions {', '.join(kw)} with burst or flooding indicators — urgent "
            "water infrastructure failure escalated to Critical priority within the 12h SLA."
            if priority == "Critical"
            else f"Complaint mentions {', '.join(kw)} — water supply issue assigned High priority with a 12h SLA."
        )
    elif any(k in text for k in ("garbage", "waste", "trash", "dumpster")):
        category = "Waste Management"
        assigned_department = "Municipal Solid Waste Management"
        priority = "Medium"
        priority_score = 55
        estimated_sla_hours = 48
        kw = hits(["garbage", "waste", "trash", "dumpster"])
        reasoning = f"Complaint mentions {', '.join(kw)} — public sanitation concern assigned Medium priority with a 48h SLA."
    elif any(k in text for k in ("spark", "light", "wire", "electricity", "transformer")):
        category = "Electricity & Streetlights"
        assigned_department = "Electrical Engineering & Utilities"
        priority = "Critical" if ("spark" in text or "school" in text) else "High"
        priority_score = 98 if priority == "Critical" else 70
        estimated_sla_hours = 12
        kw = hits(["spark", "light", "wire", "electricity", "transformer"])
        reasoning = (
            f"Complaint mentions {', '.join(kw)} with sparking or school-adjacent risk — "
            "electrical hazard escalated to Critical priority within the 12h SLA."
            if priority == "Critical"
            else f"Complaint mentions {', '.join(kw)} — electrical infrastructure issue assigned High priority with a 12h SLA."
        )
    elif any(k in text for k in ("drain", "sewage", "clog", "waterlog")):
        category = "Drainage & Sewage"
        assigned_department = "Urban Drainage Division"
        priority = "High"
        priority_score = 75
        estimated_sla_hours = 24
        kw = hits(["drain", "sewage", "clog", "waterlog"])
        reasoning = f"Complaint mentions {', '.join(kw)} — urban drainage blockage assigned High priority with a 24h SLA."
    elif any(k in text for k in ("park", "tree", "branch", "grass")):
        category = "Parks & Sanitation"
        assigned_department = "Parks & Horticulture Department"
        priority = "Low"
        priority_score = 35
        estimated_sla_hours = 72
        kw = hits(["park", "tree", "branch", "grass"])
        reasoning = f"Complaint mentions {', '.join(kw)} — parks & greenery maintenance item assigned Low priority with a 72h SLA."

    return {
        "category": category,
        "assignedDepartment": assigned_department,
        "priority": priority,
        "priorityScore": priority_score,
        "priorityReasoning": reasoning,
        "summary": complaint_text[:120] + ("..." if len(complaint_text) > 120 else ""),
        "recommendedActions": [
            "Inspect reported location",
            "Verify issue severity with field crew",
            "Schedule repair dispatch within SLA window",
        ],
        "estimatedSLAHours": estimated_sla_hours,
        "imageAnalysis": "Uploaded photo registered for visual inspection." if image_base64 else None,
        "detectedKeywords": [w for w in text.split(" ") if len(w) > 4][:5],
        "confidence": 85,
        "needsHumanReview": priority == "Critical",
    }


SYSTEM_PROMPT_ANALYZE = """You are an expert AI Civic Intelligence Analyzer for municipal governance.
Your task is to analyze a citizen's complaint submission (text and optional photo) and produce structured operational JSON output.

Categories available:
- 'Roads & Potholes' -> Department of Public Works
- 'Water Supply & Leakage' -> Water & Sanitation Authority
- 'Waste Management' -> Municipal Solid Waste Management
- 'Electricity & Streetlights' -> Electrical Engineering & Utilities
- 'Drainage & Sewage' -> Urban Drainage Division
- 'Public Safety' -> Public Safety & Emergency Operations
- 'Parks & Sanitation' -> Parks & Horticulture Department
- 'Other' -> General Municipal Services

JSON Output Schema Required:
{
  "category": string (must match one of the exact category strings above),
  "assignedDepartment": string,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "priorityScore": number (1-100),
  "priorityReasoning": string,
  "summary": string,
  "recommendedActions": string[],
  "estimatedSLAHours": number,
  "imageAnalysis": string,
  "detectedKeywords": string[]
}"""


def _analyze_schema():
    from google.genai import types

    return types.Schema(
        type=types.Type.OBJECT,
        properties={
            "category": types.Schema(type=types.Type.STRING),
            "assignedDepartment": types.Schema(type=types.Type.STRING),
            "priority": types.Schema(type=types.Type.STRING),
            "priorityScore": types.Schema(type=types.Type.NUMBER),
            "priorityReasoning": types.Schema(type=types.Type.STRING),
            "summary": types.Schema(type=types.Type.STRING),
            "recommendedActions": types.Schema(
                type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)
            ),
            "estimatedSLAHours": types.Schema(type=types.Type.NUMBER),
            "imageAnalysis": types.Schema(type=types.Type.STRING),
            "detectedKeywords": types.Schema(
                type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)
            ),
        },
        required=[
            "category", "assignedDepartment", "priority", "priorityScore",
            "priorityReasoning", "summary", "recommendedActions",
            "estimatedSLAHours", "detectedKeywords",
        ],
    )


class AnalyzeRequest(BaseModel):
    complaintText: Optional[str] = None
    imageBase64: Optional[str] = None
    imageMimeType: Optional[str] = None
    citizenLocation: Optional[str] = None


@router.post("/api/analyze-complaint")
async def analyze_complaint(body: AnalyzeRequest):
    if not body.complaintText or not body.complaintText.strip():
        raise HTTPException(status_code=400, detail="Complaint text is required")

    ai = get_gemini_client()
    if not ai:
        return generate_fallback_analysis(body.complaintText, body.imageBase64)

    try:
        from google.genai import types

        parts = [
            types.Part(
                text=(
                    f"Citizen Complaint Description:\n{body.complaintText}\n"
                    f"Location: {body.citizenLocation or 'City limits'}"
                )
            )
        ]
        if body.imageBase64 and body.imageMimeType:
            parts.insert(
                0,
                types.Part(
                    inline_data=types.Blob(
                        data=body.imageBase64.replace(
                            "data:image/", "data:image/"
                        ).split(",", 1)[-1] if "," in body.imageBase64 else body.imageBase64,
                        mime_type=body.imageMimeType,
                    )
                ),
            )

        response = ai.models.generate_content(
            model=GEMINI_MODEL,
            contents=[types.Content(parts=parts)],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT_ANALYZE,
                response_mime_type="application/json",
                response_schema=_analyze_schema(),
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini model")
        return json.loads(response.text.strip())
    except Exception as exc:  # noqa: BLE001 - fall back like Express does
        print(f"Error analyzing complaint with Gemini: {exc}")
        return generate_fallback_analysis(body.complaintText, body.imageBase64)


class ChatRequest(BaseModel):
    message: Optional[str] = None


def build_stats_summary() -> dict:
    complaints = db.complaints
    return {
        "total": len(complaints),
        "critical": sum(1 for c in complaints if c.get("priority") == "Critical"),
        "high": sum(1 for c in complaints if c.get("priority") == "High"),
        "inProgress": sum(1 for c in complaints if c.get("status") == "In Progress"),
        "resolved": sum(
            1 for c in complaints if c.get("status") in ("Resolved", "Closed")
        ),
        "totalEstimatedBudget": sum(
            (c.get("estimatedCost") or {}).get("total", 0) for c in complaints
        ),
        "totalActualCost": sum(
            (c.get("actualCost") or {}).get("total", 0) for c in complaints
        ),
        "categoriesCount": len(db.categories),
        "complaintListBrief": [
            {
                "id": c.get("trackingId"),
                "title": c.get("title"),
                "category": c.get("category"),
                "department": c.get("assignedDepartment"),
                "priority": c.get("priority"),
                "status": c.get("status"),
                "ward": (c.get("location") or {}).get("ward"),
                "officer": c.get("assignedOfficer") or "Unassigned",
                "slaHours": c.get("estimatedSLAHours"),
                "estimatedCost": (c.get("estimatedCost") or {}).get("total", 0),
                "actualCost": (c.get("actualCost") or {}).get("total", 0),
            }
            for c in complaints
        ],
    }


@router.post("/api/chat-assistant")
async def chat_assistant(body: ChatRequest):
    if not body.message or not isinstance(body.message, str):
        raise HTTPException(status_code=400, detail="Message is required")

    stats = build_stats_summary()

    ai = get_gemini_client()
    if not ai:
        reply = (
            f"I am your AI Civic Assistant. System status: **{stats['total']} total complaints**, "
            f"**{stats['critical']} critical emergencies**, "
            f"**PKR {stats['totalEstimatedBudget']:,} estimated budget**, and "
            f"**{stats['categoriesCount']} active categories**."
        )
        return {"reply": reply}

    try:
        system_prompt = (
            'You are "AI Smart Civic AI", an intelligent municipal operational copilot for AI Smart Civic Services.\n'
            "You have real-time access to municipal data.\n"
            "Summarize data accurately, highlight cost overruns, SLA risks, officer workloads, and ward hotspots when asked.\n"
            f"Current Live System State: {json.dumps(stats)}"
        )
        response = ai.models.generate_content(
            model=GEMINI_MODEL,
            contents=body.message,
            config={"system_instruction": system_prompt},
        )
        return {"reply": response.text or "No response generated."}
    except Exception as exc:  # noqa: BLE001
        print(f"Chat assistant error: {exc}")
        raise HTTPException(status_code=500, detail="Failed to process AI assistant request.")
