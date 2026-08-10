import time

from fastapi import APIRouter, Depends, HTTPException

from ..db import db
from ..deps import extract_user_role, require_roles
from ..models import CategoryCreateRequest, CategoryPatchRequest, ExtendedUserRole
from .health import iso_now
from .live import publish_event

router = APIRouter(tags=["categories"])

CATEGORY_ADMIN = require_roles(
    "municipal_admin",
    "super_admin",
    message="Permission denied: Category management requires Municipal Admin or Super Admin role",
)


def _audit_label(role: ExtendedUserRole) -> str:
    return "Super Admin" if role == "super_admin" else "Municipal Admin Lead"


@router.get("/api/categories")
async def list_categories():
    return db.categories


@router.post("/api/categories", status_code=201)
async def create_category(
    body: CategoryCreateRequest,
    role: ExtendedUserRole = Depends(extract_user_role),
    _: None = Depends(CATEGORY_ADMIN),
):
    if not body.name or not body.description or not body.department:
        raise HTTPException(
            status_code=400,
            detail="Missing required fields (name, description, department)",
        )

    now = iso_now()
    new_cat = {
        "id": f"cat-{int(time.time() * 1000)}",
        "name": body.name,
        "description": body.description,
        "department": body.department,
        "defaultPriority": body.defaultPriority or "Medium",
        "defaultSLAHours": body.defaultSLAHours if body.defaultSLAHours is not None else 24,
        "status": body.status or "Active",
        "subcategories": body.subcategories if body.subcategories is not None else [],
        "createdAt": now,
        "updatedAt": now,
    }

    db.append_category(new_cat)
    publish_event({"type": "category.updated", "categoryId": new_cat["id"], "name": new_cat["name"], "timestamp": now})
    db.prepend_audit(
        {
            "id": f"aud-{int(time.time() * 1000)}",
            "user": _audit_label(role),
            "role": role,
            "action": "Created Complaint Category",
            "oldValue": None,
            "newValue": body.name,
            "reason": f"Added category {body.name} for {body.department}",
            "timestamp": now,
        },
    )
    return new_cat


@router.patch("/api/categories/{category_id}")
async def update_category(
    category_id: str,
    body: CategoryPatchRequest,
    role: ExtendedUserRole = Depends(extract_user_role),
    _: None = Depends(CATEGORY_ADMIN),
):
    index = next(
        (i for i, c in enumerate(db.categories) if c["id"] == category_id), None
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Category not found")

    existing = db.categories[index]
    # Express merges req.body wholesale; only fields actually present are merged
    updated = {**existing}
    for field in body.model_fields_set:
        updated[field] = getattr(body, field)
    updated["updatedAt"] = iso_now()

    db.categories[index] = updated
    db.update_category(updated)
    publish_event({"type": "category.updated", "categoryId": updated["id"], "name": updated["name"], "timestamp": updated["updatedAt"]})
    db.prepend_audit(
        {
            "id": f"aud-{int(time.time() * 1000)}",
            "user": _audit_label(role),
            "role": role,
            "action": "Updated Complaint Category Specs",
            "oldValue": existing["name"],
            "newValue": updated["name"],
            "reason": f"Updated specs for category {updated['name']}",
            "timestamp": iso_now(),
        },
    )
    return updated
