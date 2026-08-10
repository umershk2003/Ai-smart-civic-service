from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..auth import DEMO_ACCOUNTS, DEMO_BY_ROLE, create_token
from ..models import ExtendedUserRole

router = APIRouter(tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class DemoLoginRequest(BaseModel):
    role: ExtendedUserRole


@router.post("/api/auth/login")
async def login(body: LoginRequest):
    account = next(
        (a for a in DEMO_ACCOUNTS if a["email"].lower() == body.email.strip().lower()),
        None,
    )
    if not account or account["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_token(
        account["email"], account["name"], account["role"], account.get("department")
    )
    return {
        "token": token,
        "user": {
            "id": f"usr-{account['role']}",
            "name": account["name"],
            "email": account["email"],
            "role": account["role"],
            "department": account.get("department"),
        },
    }


@router.post("/api/auth/demo-login")
async def demo_login(body: DemoLoginRequest):
    """Mint a token for a demo role without a password (demo persona switching)."""
    account = DEMO_BY_ROLE[body.role]
    token = create_token(
        account["email"], account["name"], account["role"], account.get("department")
    )
    return {
        "token": token,
        "user": {
            "id": f"usr-{account['role']}",
            "name": account["name"],
            "email": account["email"],
            "role": account["role"],
            "department": account.get("department"),
        },
    }
