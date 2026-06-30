"""compliance_transactions table

Revision ID: 0001
Revises:
Create Date: 2026-06-30
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "compliance_transactions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("event_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payment_type", sa.Text, nullable=False),
        sa.Column("product_category", sa.Text, nullable=False),
        sa.Column("order_price", sa.Float, nullable=False),
        sa.Column("customer_job", sa.Text, nullable=False),
        sa.Column("customer_email", sa.Text, nullable=False),
        sa.Column("billing_city", sa.Text, nullable=False),
        sa.Column("billing_state", sa.Text, nullable=False),
        sa.Column("billing_country", sa.Text, nullable=False),
        sa.Column("billing_zip", sa.Text, nullable=False),
        sa.Column("billing_latitude", sa.Float, nullable=False),
        sa.Column("billing_longitude", sa.Float, nullable=False),
        sa.Column("ip_address", sa.Text, nullable=False),
        sa.Column("user_agent", sa.Text, nullable=False),
        sa.Column("merchant", sa.Text, nullable=False),
        sa.Column("is_fraud", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("fraud_scenario", sa.Text, nullable=True),
        sa.Column("assigned_label", sa.Text, nullable=True),
        sa.Column("similarity_score", sa.Float, nullable=True),
        sa.Column("idempotency_key", sa.Text, nullable=True, unique=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_tx_created_at", "compliance_transactions", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_tx_created_at", table_name="compliance_transactions")
    op.drop_table("compliance_transactions")
