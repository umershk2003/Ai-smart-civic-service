"""Persistent in-memory database store, backed by SQLite.

Data flows: the API layer works against the in-memory lists (fast reads, same
filtering logic as the Express backend), and every mutation is also upserted to
SQLite so records survive server restarts. On startup the store hydrates from
SQLite if data exists, otherwise it seeds from backend/seed/*.json.

Storage layout: one `documents` table (kind + original id + JSON blob) — records
are JSON documents matching the API contract, so nothing is lost in a
relational mapping. Schema evolution is handled by Alembic (backend/alembic);
create_all() is only a first-run bootstrap for fresh checkouts.

DB file: backend/data/civic.db (gitignored).
"""
import copy
import json
from pathlib import Path

from sqlalchemy import Column, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .models import AuditEntry, CivicCategoryDef, Complaint

SEED_FILE = Path(__file__).resolve().parents[1] / "seed" / "seed_data.json"
LOCATIONS_FILE = Path(__file__).resolve().parents[1] / "seed" / "locations.json"
DB_PATH = Path(__file__).resolve().parents[1] / "data" / "civic.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

Base = declarative_base()

KIND_COMPLAINT = "complaint"
KIND_CATEGORY = "category"
KIND_AUDIT = "audit_log"
KIND_NOTIFICATION = "notification"


class DocRecord(Base):
    __tablename__ = "documents"

    kind = Column(String(32), primary_key=True, index=True)
    doc_id = Column(String(128), primary_key=True)
    data = Column(Text, nullable=False)


_engine = create_engine(
    f"sqlite:///{DB_PATH.as_posix()}", connect_args={"check_same_thread": False}
)
# First-run bootstrap; Alembic owns subsequent schema changes.
Base.metadata.create_all(_engine)
_Session = sessionmaker(bind=_engine)


class Database:
    def __init__(self) -> None:
        self.complaints: list[dict] = []
        self.categories: list[dict] = []
        self.audit_logs: list[dict] = []
        self.notifications: list[dict] = []
        self.locations: dict = {}
        self._seed: dict = {}
        self.load_seed()
        self.load_from_db()

    # -- loading -----------------------------------------------------------

    def load_seed(self) -> None:
        self._seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        # Fail fast if the seed drifts from the contract shapes
        for c in self._seed["complaints"]:
            Complaint.model_validate(c)
        for cat in self._seed["categories"]:
            CivicCategoryDef.model_validate(cat)
        for a in self._seed["auditLogs"]:
            AuditEntry.model_validate(a)
        self.locations = json.loads(LOCATIONS_FILE.read_text(encoding="utf-8"))

    def load_from_db(self) -> None:
        """Hydrate from SQLite if present; otherwise seed and persist."""
        with _Session() as s:
            rows = s.query(DocRecord).all()
        by_kind: dict[str, list[dict]] = {"complaint": [], "category": [], "audit_log": [], "notification": []}
        for r in rows:
            by_kind.setdefault(r.kind, []).append(json.loads(r.data))

        if by_kind[KIND_COMPLAINT]:
            self.complaints = by_kind[KIND_COMPLAINT]
            self.categories = by_kind[KIND_CATEGORY] or copy.deepcopy(self._seed["categories"])
            self.audit_logs = by_kind[KIND_AUDIT]
            self.notifications = by_kind[KIND_NOTIFICATION]
        else:
            self.reset()

    # -- persistence -------------------------------------------------------

    def _upsert(self, kind: str, doc: dict) -> None:
        with _Session() as s:
            existing = s.get(DocRecord, (kind, doc["id"]))
            if existing is not None:
                existing.data = json.dumps(doc)
            else:
                s.add(DocRecord(kind=kind, doc_id=doc["id"], data=json.dumps(doc)))
            s.commit()

    def _delete_all(self, kind: str) -> None:
        with _Session() as s:
            s.query(DocRecord).filter_by(kind=kind).delete()
            s.commit()

    # Mutation helpers keep the in-memory list and SQLite in sync.

    def insert_complaint(self, doc: dict) -> None:
        self.complaints.insert(0, doc)
        self._upsert(KIND_COMPLAINT, doc)

    def update_complaint(self, doc: dict) -> None:
        self._upsert(KIND_COMPLAINT, doc)

    def append_category(self, doc: dict) -> None:
        self.categories.append(doc)
        self._upsert(KIND_CATEGORY, doc)

    def update_category(self, doc: dict) -> None:
        self._upsert(KIND_CATEGORY, doc)

    def prepend_audit(self, entry: dict) -> None:
        self.audit_logs.insert(0, entry)
        self._upsert(KIND_AUDIT, entry)

    def append_notification(self, notif: dict) -> None:
        self.notifications.insert(0, notif)
        self._upsert(KIND_NOTIFICATION, notif)

    def update_notification(self, notif: dict) -> None:
        self._upsert(KIND_NOTIFICATION, notif)

    def reset(self) -> None:
        """Restore all DBs from the seed and persist (POST /api/seed-reset)."""
        self.complaints = copy.deepcopy(self._seed["complaints"])
        self.categories = copy.deepcopy(self._seed["categories"])
        self.audit_logs = copy.deepcopy(self._seed["auditLogs"])
        self.notifications = []
        for kind in (KIND_COMPLAINT, KIND_CATEGORY, KIND_AUDIT, KIND_NOTIFICATION):
            self._delete_all(kind)
        for c in self.complaints:
            self._upsert(KIND_COMPLAINT, c)
        for cat in self.categories:
            self._upsert(KIND_CATEGORY, cat)
        for a in self.audit_logs:
            self._upsert(KIND_AUDIT, a)


db = Database()
