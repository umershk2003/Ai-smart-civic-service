"""RBAC dependencies, mirroring server.ts's extractUserRole + role checks.

The backend remains authoritative: the frontend hides unauthorized UI, and the
API re-checks the x-user-role header on sensitive operations.
"""
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request

from .auth import decode_token
from .models import ExtendedUserRole

ALLOWED_ROLES: set[str] = {
    "citizen",
    "field_officer",
    "supervisor",
    "municipal_admin",
    "super_admin",
}


def extract_user_role(request: Request) -> ExtendedUserRole:
    """Same fallback as Express: unknown/missing header -> 'citizen'."""
    role = request.headers.get("x-user-role", "")
    return role if role in ALLOWED_ROLES else "citizen"


def require_roles(*allowed: ExtendedUserRole, message: Optional[str] = None):
    """Dependency that 403s unless the caller's x-user-role is in `allowed`."""

    async def dependency(
        role: ExtendedUserRole = Depends(extract_user_role),
    ) -> None:
        if role not in allowed:
            raise HTTPException(status_code=403, detail=message or "Permission denied")

    return dependency


def get_jwt_user(request: Request) -> Optional[Dict[str, Any]]:
    """Decode the caller's JWT from the Authorization header, if present and valid."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return decode_token(auth[7:])
    return None


def require_auth(*allowed: ExtendedUserRole):
    """Dependency for hardened endpoints: requires a valid JWT and (optionally) a role.

    Returns the decoded token payload so handlers can use the authenticated identity.
    """

    async def dependency(user: Optional[Dict[str, Any]] = Depends(get_jwt_user)) -> Dict[str, Any]:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        if allowed and user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user

    return dependency
