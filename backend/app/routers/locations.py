"""Pakistan administrative location hierarchy.

Served from backend/seed/locations.json (generated from src/data/locations.ts by
scripts/export_seed.mjs). The frontend still uses its client-side cascade for the
forms; these endpoints exist so administrative tools can resolve the hierarchy
server-side. No GIS/map data — pure structured administrative geography.
"""
from typing import Optional

from fastapi import APIRouter

from ..db import db

router = APIRouter(tags=["locations"])


def _children(collection: str, parent_key: Optional[str], parent_id: Optional[str]):
    rows = db.locations.get(collection, [])
    if not parent_key or not parent_id:
        return rows
    return [r for r in rows if r.get(parent_key) == parent_id]


@router.get("/api/locations/provinces")
async def provinces():
    return _children("provinces", None, None)


@router.get("/api/locations/divisions")
async def divisions(province_id: Optional[str] = None):
    return _children("divisions", "provinceId", province_id)


@router.get("/api/locations/districts")
async def districts(division_id: Optional[str] = None):
    return _children("districts", "divisionId", division_id)


@router.get("/api/locations/tehsils")
async def tehsils(district_id: Optional[str] = None):
    return _children("tehsils", "districtId", district_id)


@router.get("/api/locations/municipalities")
async def municipalities(tehsil_id: Optional[str] = None):
    return _children("municipalities", "tehsilId", tehsil_id)


@router.get("/api/locations/wards")
async def wards(municipality_id: Optional[str] = None):
    return _children("wards", "municipalityId", municipality_id)


@router.get("/api/locations/areas")
async def areas(ward_id: Optional[str] = None):
    return _children("areas", "wardId", ward_id)
