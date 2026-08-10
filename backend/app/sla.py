"""SLA breach detection + live escalation.

A background task scans open complaints whose SLA deadline has passed and emits
a persisted, role-targeted critical notification (deduplicated per ticket). The
first scan runs immediately on startup so overdue seed tickets escalate right
away; later scans run every BREACH_SCAN_INTERVAL seconds.
"""
import asyncio
import time
from datetime import datetime

from .db import db
from .routers.live import push_notification

BREACH_SCAN_INTERVAL = 45  # seconds
DONE_STATUSES = ("Resolved", "Closed", "Rejected")

# Roles notified on any SLA breach.
BREACH_ROLES = ["supervisor", "municipal_admin", "super_admin", "field_officer"]


def _deadline_ms(complaint: dict) -> float | None:
    created = complaint.get("createdAt")
    if not created:
        return None
    try:
        created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
    except ValueError:
        return None
    return created_dt.timestamp() * 1000 + complaint.get("estimatedSLAHours", 0) * 3_600_000


def _already_notified(tracking_id: str) -> bool:
    return any(
        n.get("action") == "sla_breach" and n.get("ticketId") == tracking_id
        for n in db.notifications
    )


def find_breaches() -> list[dict]:
    now_ms = time.time() * 1000
    return [
        c for c in db.complaints
        if c.get("status") not in DONE_STATUSES
        and (deadline := _deadline_ms(c)) is not None
        and deadline < now_ms
        and not _already_notified(c["trackingId"])
    ]


async def run_breach_scan() -> None:
    """One scan pass: notify (deduplicated) for every breached open ticket."""
    for c in find_breaches():
        push_notification(
            BREACH_ROLES,
            f"SLA breach: {c['trackingId']}",
            f"{c['title']} — SLA of {c.get('estimatedSLAHours')}h exceeded. Escalated for immediate attention.",
            tone="critical",
            tab="desk",
            action="sla_breach",
            ticketId=c["trackingId"],
        )


async def sla_task() -> None:
    while True:
        try:
            await run_breach_scan()
        except Exception as exc:  # noqa: BLE001 - never kill the scanner
            print(f"SLA scan error: {exc}")
        await asyncio.sleep(BREACH_SCAN_INTERVAL)
