"""Deterministic synthetic transaction generator (Faker).

All data here is fabricated. The fraud rate is intentionally inflated above
real-world levels for demo visibility. Ground-truth `is_fraud` / `fraud_scenario`
are emitted for evaluation and display only — they never enter the feature vector.

Five typologies are planted round-robin so each is well represented:
  card_testing, structuring, whale_anomaly, account_takeover, odd_hour_burst.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from faker import Faker
from feature_pipeline.constants import (
    FOREIGN_COUNTRIES,
    FRAUD_SCENARIOS,
    HOME_COUNTRY,
    NG_PAYMENT_TYPES,
    NG_PRODUCT_CATEGORIES,
    NIGERIA_COUNTRY,
    US_PAYMENT_TYPES,
    US_PRODUCT_CATEGORIES,
)

EPOCH = datetime(2025, 1, 1, tzinfo=timezone.utc)


# Nigerian cities used for the CBN demonstration (synthetic; en_US Faker has no NG
# locale data). Coordinates are approximate city centres.
NG_CITIES: list[tuple[str, str, float, float]] = [
    ("Lagos", "LA", 6.45, 3.39),
    ("Abuja", "FC", 9.06, 7.49),
    ("Kano", "KN", 12.00, 8.52),
    ("Port Harcourt", "RI", 4.82, 7.03),
    ("Ibadan", "OY", 7.38, 3.93),
    ("Benin City", "ED", 6.34, 5.62),
    ("Kaduna", "KD", 10.52, 7.44),
    ("Enugu", "EN", 6.46, 7.55),
]


@dataclass
class Customer:
    name: str
    job: str
    email: str
    city: str
    state: str
    zip_code: str
    latitude: float
    longitude: float
    spend_mean: float
    spend_std: float
    country: str  # "US" or "NG" — drives region-appropriate channels/categories


@dataclass
class Transaction:
    event_timestamp: str
    payment_type: str
    product_category: str
    order_price: float
    customer_job: str
    customer_email: str
    billing_city: str
    billing_state: str
    billing_country: str
    billing_zip: str
    billing_latitude: float
    billing_longitude: float
    ip_address: str
    user_agent: str
    merchant: str
    is_fraud: bool
    fraud_scenario: str | None


def _build_customers(fake: Faker, n: int, ng_fraction: float = 0.4) -> list[Customer]:
    customers = []
    for _ in range(n):
        mean = round(random.uniform(40, 600), 2)
        if random.random() < ng_fraction:
            city, state, lat, lng = random.choice(NG_CITIES)
            country, zip_code = NIGERIA_COUNTRY, fake.numerify("######")
            lat, lng = round(lat + random.uniform(-0.2, 0.2), 4), round(lng + random.uniform(-0.2, 0.2), 4)
        else:
            city, state = fake.city(), fake.state_abbr()
            country, zip_code = HOME_COUNTRY, fake.zipcode()
            lat, lng = float(fake.latitude()), float(fake.longitude())
        customers.append(
            Customer(
                name=fake.name(), job=fake.job(), email=fake.email(),
                city=city, state=state, zip_code=zip_code, latitude=lat, longitude=lng,
                spend_mean=mean, spend_std=round(mean * 0.3, 2), country=country,
            )
        )
    return customers


def _ts(offset_days: float, hour: int | None = None) -> str:
    t = EPOCH + timedelta(days=offset_days)
    if hour is not None:
        t = t.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))
    return t.isoformat()


def _base(fake: Faker, cust: Customer, **overrides: Any) -> Transaction:
    is_ng = cust.country == NIGERIA_COUNTRY
    payments = NG_PAYMENT_TYPES if is_ng else US_PAYMENT_TYPES
    categories = NG_PRODUCT_CATEGORIES if is_ng else US_PRODUCT_CATEGORIES
    fields: dict[str, Any] = dict(
        event_timestamp=_ts(random.uniform(0, 120), hour=random.randint(8, 21)),
        payment_type=random.choice(payments),
        product_category=random.choice(categories),
        order_price=round(max(1.0, random.gauss(cust.spend_mean, cust.spend_std)), 2),
        customer_job=cust.job,
        customer_email=cust.email,
        billing_city=cust.city,
        billing_state=cust.state,
        billing_country=cust.country,
        billing_zip=cust.zip_code,
        billing_latitude=cust.latitude,
        billing_longitude=cust.longitude,
        ip_address=fake.ipv4(),
        user_agent=fake.user_agent(),
        merchant=fake.company(),
        is_fraud=False,
        fraud_scenario=None,
    )
    fields.update(overrides)
    return Transaction(**fields)


def _fraud(fake: Faker, cust: Customer, scenario: str) -> list[Transaction]:
    """Return one or more transactions implementing a typology."""
    if scenario == "card_testing":
        day = random.uniform(0, 120)
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(0.5, 2.99), 2),
                payment_type="credit_card",
                event_timestamp=_ts(day, hour=random.randint(8, 21)),
                is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(5, 9))
        ]
    if scenario == "structuring":
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(9000, 9999), 2),
                payment_type=random.choice(["wire", "crypto"]),
                is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(2, 4))
        ]
    if scenario == "whale_anomaly":
        return [
            _base(
                fake, cust,
                order_price=round(cust.spend_mean * random.uniform(80, 200), 2),
                is_fraud=True, fraud_scenario=scenario,
            )
        ]
    if scenario == "account_takeover":
        return [
            _base(
                fake, cust,
                billing_country=random.choice(FOREIGN_COUNTRIES),
                billing_latitude=float(fake.latitude()),
                billing_longitude=float(fake.longitude()),
                event_timestamp=_ts(random.uniform(0, 120), hour=random.randint(1, 4)),
                user_agent=fake.user_agent(),
                is_fraud=True, fraud_scenario=scenario,
            )
        ]
    if scenario == "odd_hour_burst":
        day = random.uniform(0, 120)
        return [
            _base(
                fake, cust,
                order_price=round(cust.spend_mean * random.uniform(5, 12), 2),
                event_timestamp=_ts(day, hour=random.randint(1, 4)),
                is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(3, 5))
        ]
    # --- CBN demonstration typologies (Nigerian context) ---------------------------
    if scenario == "fx_structuring":
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(9000, 9999), 2),
                payment_type=random.choice(["wire", "crypto", "bank_transfer"]),
                product_category="fx_remittance", billing_country=NIGERIA_COUNTRY,
                is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(2, 4))
        ]
    if scenario == "crypto_fx_evasion":
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(20000, 80000), 2),
                payment_type="crypto", product_category="fx_remittance",
                billing_country=NIGERIA_COUNTRY, is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(1, 2))
        ]
    if scenario == "pos_agent_cashout":
        day = random.uniform(0, 120)
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(500, 2500), 2),
                payment_type="pos", product_category="grocery",
                billing_country=NIGERIA_COUNTRY,
                event_timestamp=_ts(day, hour=random.randint(9, 20)),
                is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(3, 6))
        ]
    if scenario == "ussd_micro_burst":
        return [
            _base(
                fake, cust,
                order_price=round(random.uniform(0.5, 2.99), 2),
                payment_type="ussd", product_category="airtime",
                billing_country=NIGERIA_COUNTRY, is_fraud=True, fraud_scenario=scenario,
            )
            for _ in range(random.randint(5, 9))
        ]
    # sim_swap_takeover
    return [
        _base(
            fake, cust,
            order_price=round(cust.spend_mean * random.uniform(10, 30), 2),
            payment_type=random.choice(["bank_transfer", "mobile_money"]),
            billing_country=NIGERIA_COUNTRY,
            event_timestamp=_ts(random.uniform(0, 120), hour=random.randint(1, 4)),
            user_agent=fake.user_agent(),
            is_fraud=True, fraud_scenario=scenario,
        )
    ]


def generate(count: int, fraud_rate: float, seed: int) -> list[Transaction]:
    random.seed(seed)
    Faker.seed(seed)
    fake = Faker()
    customers = _build_customers(fake, max(50, count // 8))

    rows: list[Transaction] = []
    fraud_target = int(count * fraud_rate)
    scenario_idx = 0
    while len([r for r in rows if r.is_fraud]) < fraud_target:
        scenario = FRAUD_SCENARIOS[scenario_idx % len(FRAUD_SCENARIOS)]
        scenario_idx += 1
        rows.extend(_fraud(fake, random.choice(customers), scenario))

    while len(rows) < count:
        rows.append(_base(fake, random.choice(customers)))

    random.shuffle(rows)
    return rows[:count] if len(rows) > count else rows


def summarize(rows: list[Transaction]) -> dict[str, Any]:
    fraud = [r for r in rows if r.is_fraud]
    by_scenario = Counter(r.fraud_scenario for r in fraud)
    return {
        "rows": len(rows),
        "fraud": len(fraud),
        "fraud_rate": round(len(fraud) / len(rows), 4) if rows else 0.0,
        "by_scenario": dict(by_scenario),
    }


def _write(rows: list[Transaction], fmt: str, out: str) -> None:
    dicts = [asdict(r) for r in rows]
    if fmt == "json":
        with open(out, "w") as fh:
            json.dump(dicts, fh, indent=2)
    else:
        with open(out, "w", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(dicts[0].keys()))
            writer.writeheader()
            writer.writerows(dicts)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic transactions")
    parser.add_argument("--count", type=int, default=1500)
    parser.add_argument("--fraud-rate", type=float, default=0.055)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--format", choices=["csv", "json"], default="csv")
    parser.add_argument("--out", default="transactions.csv")
    args = parser.parse_args()

    rows = generate(args.count, args.fraud_rate, args.seed)
    _write(rows, args.format, args.out)
    summary = summarize(rows)
    print(json.dumps(summary, indent=2))
    missing = set(FRAUD_SCENARIOS) - set(summary["by_scenario"])
    if missing:
        raise SystemExit(f"missing typologies: {missing}")


if __name__ == "__main__":
    main()
