"""JWT authentication for the API.

Demo-mode identity: the platform's demo accounts (mirroring the frontend's
DEMO_ACCOUNTS) can log in to receive a JWT. Sensitive endpoints require a valid
token; the legacy x-user-role header remains the identity source for the
read/self-service surface (see deps.py).

In production set JWT_SECRET; the default is for local demos only.
"""
import os
import time
from typing import Any, Optional

import jwt

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_SECONDS = 24 * 60 * 60

# Mirrors src/auth/AuthContext.tsx DEMO_ACCOUNTS (passwords are demo-only).
DEMO_ACCOUNTS: list[dict[str, Any]] = [
    {"email": "citizen@civic.com", "password": "citizen123", "name": "Zoya Khan", "role": "citizen"},
    {
        "email": "officer@civic.com", "password": "officer123",
        "name": "Officer Imran Shahid", "role": "field_officer",
        "department": "Department of Public Works",
    },
    {
        "email": "supervisor@civic.com", "password": "supervisor123",
        "name": "Supv. Khalid Mehmood", "role": "supervisor",
        "department": "Water & Sanitation Authority",
    },
    {
        "email": "admin@civic.com", "password": "admin123",
        "name": "Ahmed Khan", "role": "municipal_admin", "department": "Municipal Operations",
    },
    {"email": "superadmin@civic.com", "password": "superadmin123", "name": "Zain ul Abideen", "role": "super_admin"},
]

DEMO_BY_ROLE = {a["role"]: a for a in DEMO_ACCOUNTS}


def create_token(email: str, name: str, role: str, department: Optional[str] = None) -> str:
    now = int(time.time())
    payload = {
        "sub": email,
        "name": name,
        "role": role,
        "iat": now,
        "exp": now + TOKEN_TTL_SECONDS,
    }
    if department:
        payload["department"] = department
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
