"""Real-time layer: SSE event stream + persisted role-scoped notifications.

The stream is authenticated via a `token` query parameter because EventSource
cannot set headers. Notifications persist in SQLite (kind="notification") and
are delivered role-scoped: each notification carries the roles that should see
it, and GET /api/notifications filters by the caller's JWT role.
"""
import asyncio
import json
import random
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse

from ..auth import decode_token
from ..db import db
from ..deps import require_auth
from ..events import hub
from .health import iso_now

router = APIRouter(tags=["live"])


def push_notification(
    roles: list[str],
    title: str,
    description: str,
    tone: str = "info",
    tab: Optional[str] = None,
    action: Optional[str] = None,
    ticketId: Optional[str] = None,
) -> dict:
    """Persist a notification and broadcast a live event for it."""
    notif = {
        "id": f"n-{int(__import__('time').time() * 1000)}-{random.randint(100, 999)}",
        "roles": roles,
        "title": title,
        "description": description,
        "tone": tone,
        "tab": tab,
        "action": action,
        "ticketId": ticketId,
        "createdAt": iso_now(),
        # Read state is per-role: each role's "read" flag is derived from
        # readBy, so one role marking a notification read never clears it for
        # another (see _effective_read / list_notifications).
        "readBy": [],
    }
    db.append_notification(notif)
    asyncio.create_task(
        hub.publish({"type": "notification.new", "notification": notif})
    )
    return notif


def _effective_read(notif: dict, role: str) -> bool:
    return role in notif.get("readBy", [])


def publish_event(event: dict[str, Any]) -> None:
    asyncio.create_task(hub.publish(event))


# ---------------------------------------------------------------------------
# SSE stream
# ---------------------------------------------------------------------------

async def _event_generator(request: Request, user: dict):
    q = await hub.subscribe()
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(q.get(), timeout=15)
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"
    finally:
        await hub.unsubscribe(q)


@router.get("/api/events/stream")
async def event_stream(request: Request, token: str = Query(...)):
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return StreamingResponse(
        _event_generator(request, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@router.get("/api/notifications")
async def list_notifications(user: dict = Depends(require_auth())):
    role = user.get("role")
    mine = []
    for n in db.notifications:
        if role in n.get("roles", []):
            view = dict(n)
            view["read"] = _effective_read(n, role)
            mine.append(view)
    mine.sort(key=lambda n: n.get("createdAt", ""), reverse=True)
    return {
        "notifications": mine,
        "unreadCount": sum(1 for n in mine if not n["read"]),
    }


@router.post("/api/notifications/read")
async def mark_all_read(user: dict = Depends(require_auth())):
    role = user.get("role")
    changed = 0
    for n in db.notifications:
        if role in n.get("roles", []) and role not in n.get("readBy", []):
            n.setdefault("readBy", []).append(role)
            db.update_notification(n)
            changed += 1
    return {"read": changed, "unreadCount": 0}
