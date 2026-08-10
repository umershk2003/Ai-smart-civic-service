from fastapi import APIRouter, Depends

from ..db import db
from ..deps import require_auth

router = APIRouter(tags=["audit"])

AUDIT_VIEWER = require_auth("municipal_admin", "super_admin")


@router.get("/api/audit-logs")
async def list_audit_logs(_: dict = Depends(AUDIT_VIEWER)):
    # Hardened post-migration: audit logs require an admin JWT (was previously ungated).
    return db.audit_logs
