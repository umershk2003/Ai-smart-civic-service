import random
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ..db import db
from ..deps import extract_user_role, require_auth
from ..models import ComplaintCreateRequest, ComplaintPatchRequest, ExtendedUserRole
from .health import iso_now
from .live import publish_event, push_notification

router = APIRouter(tags=["complaints"])

DEFAULT_LOCATION = {
    "provinceId": "sindh",
    "divisionId": "karachi-division",
    "districtId": "karachi-south",
    "tehsilId": "saddar",
    "municipalityId": "karachi-mc",
    "wardId": "karachi-w1",
    "ward": "Ward 1 – Saddar",
    "area": "Saddar Bazaar",
    "address": "Municipal Ward Center, Saddar",
    "landmark": "Karachi Metropolitan Corporation",
}


def _default_analysis(description: str) -> dict:
    return {
        "category": "Other",
        "assignedDepartment": "General Municipal Services",
        "priority": "Medium",
        "priorityScore": 50,
        "priorityReasoning": "Standard priority assigned.",
        "summary": description[:100],
        "recommendedActions": ["Inspect site", "Assign to relevant officer"],
        "estimatedSLAHours": 48,
        "detectedKeywords": ["civic"],
    }


@router.get("/api/complaints")
async def list_complaints(
    request: Request,
    category: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    department: Optional[str] = Query(default=None),
    ward: Optional[str] = Query(default=None),
    officer: Optional[str] = Query(default=None),
):
    role: ExtendedUserRole = extract_user_role(request)
    filtered = list(db.complaints)

    # RBAC scoping (mirrors server.ts)
    if role == "field_officer" and officer:
        filtered = [
            c for c in filtered
            if c.get("assignedOfficer") == officer or not c.get("assignedOfficer")
        ]
    elif role == "supervisor" and department and department != "All":
        filtered = [c for c in filtered if c.get("assignedDepartment") == department]

    if category and category != "All":
        filtered = [c for c in filtered if c.get("category") == category]
    if priority and priority != "All":
        filtered = [c for c in filtered if c.get("priority") == priority]
    if status and status != "All":
        filtered = [c for c in filtered if c.get("status") == status]
    if department and department != "All":
        filtered = [c for c in filtered if c.get("assignedDepartment") == department]
    if ward and ward != "All":
        filtered = [c for c in filtered if c.get("location", {}).get("ward") == ward]
    if search and search.strip():
        q = search.lower().strip()
        filtered = [
            c for c in filtered
            if q in (c.get("title") or "").lower()
            or q in (c.get("description") or "").lower()
            or q in (c.get("trackingId") or "").lower()
            or q in (c.get("citizenName") or "").lower()
            or q in (c.get("location", {}).get("address") or "").lower()
            or q in (c.get("category") or "").lower()
        ]

    # newest first
    filtered.sort(key=lambda c: c.get("createdAt", ""), reverse=True)
    return filtered


COMPLAINT_VIEWER = require_auth()  # any authenticated role
COMPLAINT_EDITOR = require_auth("field_officer", "supervisor", "municipal_admin", "super_admin")


@router.get("/api/complaints/{id_or_tracking}")
async def get_complaint(
    id_or_tracking: str,
    _user: dict = Depends(COMPLAINT_VIEWER),
):
    found = next(
        (
            c for c in db.complaints
            if c.get("id") == id_or_tracking
            or c.get("trackingId", "").lower() == id_or_tracking.lower()
        ),
        None,
    )
    if not found:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return found


@router.post("/api/complaints", status_code=201)
async def create_complaint(body: ComplaintCreateRequest):
    if not body.description or not body.citizenName:
        raise HTTPException(
            status_code=400,
            detail="Missing required fields (description, citizenName)",
        )

    tracking_number = random.randint(1000, 9999)
    tracking_id = f"CIV-2026-{tracking_number}"
    complaint_id = f"cmp-{int(time.time() * 1000)}"
    now = iso_now()

    analysis = body.analysisResult if body.analysisResult else _default_analysis(body.description)

    new_complaint = {
        "id": complaint_id,
        "trackingId": tracking_id,
        "title": body.title or body.description[:60] + "...",
        "description": body.description,
        "citizenName": body.citizenName,
        "citizenContact": body.citizenContact or "N/A",
        "location": body.location if body.location else DEFAULT_LOCATION,
        "category": analysis["category"],
        "assignedDepartment": analysis["assignedDepartment"],
        "priority": analysis["priority"],
        "priorityScore": analysis["priorityScore"],
        "priorityReasoning": analysis["priorityReasoning"],
        "status": "Submitted",
        "summary": analysis["summary"],
        "recommendedActions": analysis["recommendedActions"],
        "estimatedSLAHours": analysis["estimatedSLAHours"],
        "detectedKeywords": analysis["detectedKeywords"],
        "createdAt": now,
        "updatedAt": now,
    }
    if body.imageUrl:
        new_complaint["imageUrl"] = body.imageUrl
    if analysis.get("imageAnalysis"):
        new_complaint["imageAnalysis"] = analysis["imageAnalysis"]

    db.insert_complaint(new_complaint)
    publish_event(
        {
            "type": "complaint.created",
            "trackingId": tracking_id,
            "title": new_complaint["title"],
            "category": new_complaint["category"],
            "priority": new_complaint["priority"],
            "status": "Submitted",
            "timestamp": now,
        }
    )
    push_notification(
        ["supervisor", "municipal_admin", "super_admin"],
        f"New report: {new_complaint['title']}",
        f"{tracking_id} · {new_complaint['category']} · awaiting AI triage",
        tone="info",
        tab="desk",
        action="complaint_created",
        ticketId=tracking_id,
    )
    db.prepend_audit(
        {
            "id": f"aud-{int(time.time() * 1000)}",
            "user": body.citizenName,
            "role": "citizen",
            "action": "Submitted Civic Complaint",
            "ticketId": tracking_id,
            "oldValue": None,
            "newValue": "Submitted",
            "reason": f"Public citizen submission: {new_complaint['title']}",
            "timestamp": now,
        },
    )
    return new_complaint


@router.patch("/api/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str,
    body: ComplaintPatchRequest,
    request: Request,
    auth_user: dict = Depends(COMPLAINT_EDITOR),
):
    role: ExtendedUserRole = auth_user.get("role")
    index = next(
        (
            i for i, c in enumerate(db.complaints)
            if c.get("id") == complaint_id or c.get("trackingId") == complaint_id
        ),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    existing = db.complaints[index]
    updated = {**existing}

    # Express merge semantics: `field || existing` for scalars, explicit
    # undefined-check for fields that may be cleared with null.
    if body.status:
        updated["status"] = body.status
    if body.category:
        updated["category"] = body.category
    if "subcategory" in body.model_fields_set:
        updated["subcategory"] = body.subcategory
    if body.assignedDepartment:
        updated["assignedDepartment"] = body.assignedDepartment
    if "assignedOfficer" in body.model_fields_set:
        updated["assignedOfficer"] = body.assignedOfficer  # None clears
    if body.priority:
        updated["priority"] = body.priority
    if body.resolutionNotes:
        updated["resolutionNotes"] = body.resolutionNotes
    if body.status == "Resolved" and existing.get("status") != "Resolved":
        updated["resolutionDate"] = iso_now()
    if body.supervisorOverride is not None:
        updated["supervisorOverride"] = body.supervisorOverride
    if isinstance(body.auditHistory, list):
        updated["auditHistory"] = body.auditHistory
    updated["updatedAt"] = iso_now()

    # Audit category overrides (mirrors server.ts)
    if body.category and body.category != existing.get("category"):
        db.prepend_audit(
            {
                "id": f"aud-{int(time.time() * 1000)}",
                "user": "Department Supervisor" if role == "supervisor" else "Municipal Admin",
                "role": role,
                "action": "Supervisor Category Override",
                "ticketId": existing.get("trackingId"),
                "oldValue": f"{existing.get('category')} ({existing.get('priority')})",
                "newValue": f"{body.category} ({body.priority or existing.get('priority')})",
                "reason": (body.supervisorOverride or {}).get("reason")
                or "Category re-classified by Supervisor review",
                "timestamp": iso_now(),
            },
        )

    # Audit meaningful transitions (status / priority / assignment) so the
    # immutable ledger reflects every real action, not just category overrides.
    actor_name = auth_user.get("name") or role
    if body.status and body.status != existing.get("status"):
        db.prepend_audit(
            {
                "id": f"aud-{int(time.time() * 1000)}",
                "user": actor_name,
                "role": role,
                "action": "Status Update",
                "ticketId": existing.get("trackingId"),
                "oldValue": existing.get("status"),
                "newValue": body.status,
                "reason": "Work order status transition",
                "timestamp": iso_now(),
            },
        )
    if body.priority and body.priority != existing.get("priority"):
        db.prepend_audit(
            {
                "id": f"aud-{int(time.time() * 1000)}",
                "user": actor_name,
                "role": role,
                "action": "Priority Change",
                "ticketId": existing.get("trackingId"),
                "oldValue": existing.get("priority"),
                "newValue": body.priority,
                "reason": "Priority re-triage",
                "timestamp": iso_now(),
            },
        )
    if (
        "assignedOfficer" in body.model_fields_set
        and body.assignedOfficer != existing.get("assignedOfficer")
    ):
        db.prepend_audit(
            {
                "id": f"aud-{int(time.time() * 1000)}",
                "user": actor_name,
                "role": role,
                "action": "Officer Assigned" if body.assignedOfficer else "Officer Unassigned",
                "ticketId": existing.get("trackingId"),
                "oldValue": existing.get("assignedOfficer") or "Unassigned",
                "newValue": body.assignedOfficer or "Unassigned",
                "reason": "Field work order assignment change",
                "timestamp": iso_now(),
            },
        )

    db.complaints[index] = updated
    db.update_complaint(updated)

    # Real-time: broadcast the change + targeted notifications
    changed = {
        k: updated.get(k)
        for k in ("status", "assignedOfficer", "priority", "category", "resolutionNotes")
        if updated.get(k) != existing.get(k)
    }
    publish_event(
        {
            "type": "complaint.updated",
            "trackingId": existing.get("trackingId"),
            "title": existing.get("title"),
            "changes": changed,
            "timestamp": iso_now(),
        }
    )
    if "assignedOfficer" in changed and changed["assignedOfficer"]:
        push_notification(
            ["field_officer"],
            f"New work order assigned",
            f"{existing.get('trackingId')} · {existing.get('title')} — now assigned to {changed['assignedOfficer']}.",
            tone="info",
            tab="field",
            action="work_order_assigned",
            ticketId=existing.get("trackingId"),
        )
    if changed.get("status") in ("Resolved", "Closed") or "category" in changed or "priority" in changed:
        push_notification(
            ["supervisor", "municipal_admin", "super_admin"],
            f"Ticket updated: {existing.get('trackingId')}",
            f"{existing.get('title')} — "
            + ", ".join(f"{k}: {v}" for k, v in changed.items()),
            tone="success" if changed.get("status") in ("Resolved", "Closed") else "info",
            tab="desk",
            action="complaint_updated",
            ticketId=existing.get("trackingId"),
        )

    return updated
