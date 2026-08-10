"""create documents table

Revision ID: 0001
Revises:
Create Date: 2026-08-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("doc_id", sa.String(length=128), nullable=False),
        sa.Column("data", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("kind", "doc_id"),
    )
    op.create_index("ix_documents_kind", "documents", ["kind"])


def downgrade() -> None:
    op.drop_index("ix_documents_kind", table_name="documents")
    op.drop_table("documents")
