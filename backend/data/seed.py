"""Seed Postgres with synthetic transactions. Truncates then loads so re-running
is deterministic. All data is synthetic (Faker); the fraud rate is inflated for
demo visibility."""

from __future__ import annotations

import argparse
import asyncio
import json

from app.config import get_settings
from app.db import Database
from data.generate_transactions import generate, summarize


async def seed(count: int, fraud_rate: float, seed_value: int) -> dict:
    rows = generate(count, fraud_rate, seed_value)
    summary = summarize(rows)
    payload = [
        {**r.__dict__, "event_timestamp": r.event_timestamp} for r in rows
    ]
    settings = get_settings()
    db = Database(settings.database_url)
    await db.connect()
    try:
        await db.truncate()
        # asyncpg wants a datetime for a timestamptz column.
        from datetime import datetime

        for p in payload:
            p["event_timestamp"] = datetime.fromisoformat(p["event_timestamp"])
        inserted = await db.bulk_insert(payload)
        summary["inserted"] = inserted
    finally:
        await db.close()
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed synthetic transactions into Postgres")
    parser.add_argument("--count", type=int, default=1500)
    parser.add_argument("--fraud-rate", type=float, default=0.055)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    summary = asyncio.run(seed(args.count, args.fraud_rate, args.seed))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
