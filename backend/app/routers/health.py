from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(tags=["health"])


def iso_now() -> str:
    """UTC ISO-8601 with Z suffix, matching JS toISOString()."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@router.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": iso_now()}
