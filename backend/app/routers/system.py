import asyncio

from fastapi import APIRouter

from ..db import db
from ..sla import run_breach_scan

router = APIRouter(tags=["system"])


@router.post("/api/seed-reset")
async def seed_reset():
    db.reset()
    # Re-scan immediately so overdue seed tickets re-escalate without waiting
    # for the background SLA interval.
    asyncio.create_task(run_breach_scan())
    return {
        "message": "Database reset to default seed data",
        "count": len(db.complaints),
    }
