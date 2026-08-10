"""Pydantic models mirroring src/types.ts (frontend/backend shared contract).

Field names keep the exact camelCase used by the API contract and the seed
JSON so serialization is byte-compatible with the Express backend.

Note: models are used to VALIDATE payloads and seed data. Live data is stored
as plain dicts (see db.py) so response serialization is a faithful 1:1 of the
Express behavior — including preserving any unknown keys in the seed and
omitting nothing.
"""
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

CivicPriority = Literal["Low", "Medium", "High", "Critical"]

ComplaintStatus = Literal[
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
    "Reopened",
    "Rejected",
]

ExtendedUserRole = Literal[
    "citizen",
    "field_officer",
    "supervisor",
    "municipal_admin",
    "super_admin",
]


class LocationData(BaseModel):
    """Structured Pakistan administrative hierarchy (IDs reference locations.json)."""

    provinceId: Optional[str] = None
    divisionId: Optional[str] = None
    districtId: Optional[str] = None
    tehsilId: Optional[str] = None
    municipalityId: Optional[str] = None
    wardId: Optional[str] = None
    area: Optional[str] = None
    address: str
    ward: Optional[str] = None  # legacy display name, kept for compatibility
    landmark: Optional[str] = None
    latitude: Optional[float] = None  # backward compat only, not used by the UI
    longitude: Optional[float] = None


class CostBreakdown(BaseModel):
    materials: float = 0
    labor: float = 0
    equipment: float = 0
    contractor: float = 0
    total: float = 0


class CitizenFeedback(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    submittedAt: str


class AIClassification(BaseModel):
    category: str
    subcategory: Optional[str] = None
    department: str
    priority: CivicPriority
    priorityScore: int
    slaHours: int
    confidence: int  # 0-100
    reason: str
    needsHumanReview: bool


class CategoryOverride(BaseModel):
    originalCategory: str
    originalSubcategory: Optional[str] = None
    finalCategory: str
    finalSubcategory: Optional[str] = None
    overrideUser: str
    overrideRole: ExtendedUserRole
    overrideReason: str
    overrideTimestamp: str


class AuditEntry(BaseModel):
    id: str
    user: str
    role: ExtendedUserRole
    action: str
    ticketId: Optional[str] = None
    oldValue: Optional[str] = None
    newValue: Optional[str] = None
    reason: Optional[str] = None
    timestamp: str
    ipInfo: Optional[str] = None


class AIAnalysisResult(BaseModel):
    category: str
    subcategory: Optional[str] = None
    assignedDepartment: str
    priority: CivicPriority
    priorityScore: int  # 1-100
    priorityReasoning: str
    summary: str
    recommendedActions: list[str]
    estimatedSLAHours: int
    imageAnalysis: Optional[str] = None
    detectedKeywords: list[str]
    confidence: int
    needsHumanReview: bool


class Complaint(BaseModel):
    id: str
    trackingId: str
    title: str
    description: str
    imageUrl: Optional[str] = None
    beforePhotos: Optional[list[str]] = None
    afterPhotos: Optional[list[str]] = None
    citizenName: str
    citizenContact: str
    location: LocationData
    category: str  # final category
    subcategory: Optional[str] = None  # final subcategory
    assignedDepartment: str
    assignedOfficer: Optional[str] = None
    supervisorName: Optional[str] = None
    priority: CivicPriority
    priorityScore: int
    priorityReasoning: str
    status: ComplaintStatus
    summary: str
    recommendedActions: list[str]
    estimatedSLAHours: int
    imageAnalysis: Optional[str] = None
    detectedKeywords: list[str]
    createdAt: str
    updatedAt: str
    resolutionNotes: Optional[str] = None
    resolutionDate: Optional[str] = None
    needsHumanReview: Optional[bool] = None
    citizenFeedback: Optional[CitizenFeedback] = None
    aiClassification: Optional[AIClassification] = None
    categoryOverride: Optional[CategoryOverride] = None
    supervisorOverride: Optional[Any] = None  # passed through unvalidated (Express parity)
    auditHistory: Optional[list[AuditEntry]] = None
    estimatedCost: Optional[CostBreakdown] = None
    actualCost: Optional[CostBreakdown] = None
    repairPlan: Optional[list[str]] = None
    reworkReason: Optional[str] = None


class CivicCategoryDef(BaseModel):
    id: str
    name: str
    description: str
    department: str
    defaultPriority: CivicPriority
    defaultSLAHours: int
    status: Literal["Active", "Inactive"]
    subcategories: list[str]
    createdAt: str
    updatedAt: str


class UserAccount(BaseModel):
    id: str
    name: str
    email: str
    role: ExtendedUserRole
    department: Optional[str] = None
    status: Literal["Active", "Inactive"]
    lastActive: str


# ---------------------------------------------------------------------------
# Request bodies — all-optional so handlers reproduce the Express validation
# (missing fields yield the exact 400 messages, not Pydantic 422s).
# ---------------------------------------------------------------------------

class CategoryCreateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    defaultPriority: Optional[str] = None
    defaultSLAHours: Optional[int] = None
    status: Optional[str] = None
    subcategories: Optional[list[str]] = None


class CategoryPatchRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    defaultPriority: Optional[str] = None
    defaultSLAHours: Optional[int] = None
    status: Optional[str] = None
    subcategories: Optional[list[str]] = None


class ComplaintCreateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    citizenName: Optional[str] = None
    citizenContact: Optional[str] = None
    location: Optional[dict] = None
    analysisResult: Optional[dict] = None


class ComplaintPatchRequest(BaseModel):
    status: Optional[str] = None
    assignedDepartment: Optional[str] = None
    assignedOfficer: Optional[str] = None  # null clears (checked via model_fields_set)
    resolutionNotes: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    supervisorOverride: Optional[dict] = None
    auditHistory: Optional[list] = None
