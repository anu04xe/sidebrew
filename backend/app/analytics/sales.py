from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.sales import Sale


@dataclass
class SalesSnapshot:
    start: datetime
    end: datetime
    df: pd.DataFrame


def _to_df(rows: list[Sale]) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(columns=["timestamp", "item", "category", "quantity", "unit_price", "store"])
    records = [
        {
            "timestamp": r.timestamp,
            "item": r.item,
            "category": r.category,
            "quantity": r.quantity,
            "unit_price": r.unit_price,
            "store": r.store,
            "payment_method": r.payment_method,
            "order_type": r.order_type,
        }
        for r in rows
    ]
    df = pd.DataFrame.from_records(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["revenue"] = df["quantity"] * df["unit_price"]
    return df


def load_sales_between(db: Session, start: datetime, end: datetime, store: str | None = None) -> SalesSnapshot:
    q = select(Sale).where(Sale.timestamp >= start, Sale.timestamp < end)
    if store and store != "All stores":
        q = q.where(Sale.store == store)
    rows = db.execute(q).scalars().all()
    return SalesSnapshot(start=start, end=end, df=_to_df(rows))


def latest_sales_day(db: Session) -> date | None:
    latest = db.execute(select(Sale.timestamp).order_by(Sale.timestamp.desc())).scalar()
    return latest.date() if latest else None


def summarize_period(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "revenue": 0.0,
            "orders": 0,
            "aov": 0.0,
            "units": 0,
            "top_products": [],
            "slow_products": [],
            "by_category": {},
            "by_store": {},
            "by_hour": {},
            "by_day": {},
        }

    product_units = df.groupby("item")["quantity"].sum().sort_values(ascending=False)

    return {
        "revenue": float(df["revenue"].sum()),
        "orders": int(len(df.index)),
        "aov": float(df["revenue"].sum() / len(df.index)) if len(df.index) else 0.0,
        "units": int(df["quantity"].sum()),
        "top_products": product_units.head(5).to_dict(),
        "slow_products": product_units.tail(3).to_dict(),
        "by_category": df.groupby("category")["revenue"].sum().round(2).to_dict(),
        "by_store": df.groupby("store")["revenue"].sum().round(2).to_dict(),
        "by_hour": df.groupby(df["timestamp"].dt.hour)["revenue"].sum().round(2).to_dict(),
        "by_day": df.groupby(df["timestamp"].dt.date)["revenue"].sum().round(2).to_dict(),
    }


def compare_against_baseline(current: dict, baseline: dict, baseline_days: int) -> dict:
    if baseline_days <= 0:
        return {"revenue_change_pct": None, "orders_change_pct": None, "aov_change_pct": None}

    avg_baseline_revenue = baseline["revenue"] / baseline_days if baseline_days else 0
    avg_baseline_orders = baseline["orders"] / baseline_days if baseline_days else 0
    avg_baseline_aov = baseline["aov"]

    def pct(current_value: float, expected_value: float) -> float | None:
        if expected_value <= 0:
            return None
        return round(((current_value - expected_value) / expected_value) * 100, 1)

    return {
        "revenue_change_pct": pct(current["revenue"], avg_baseline_revenue),
        "orders_change_pct": pct(current["orders"], avg_baseline_orders),
        "aov_change_pct": pct(current["aov"], avg_baseline_aov),
    }


def hourly_rhythm(current_df: pd.DataFrame, baseline_df: pd.DataFrame, baseline_days: int) -> list[dict]:
    current = current_df.groupby(current_df["timestamp"].dt.hour)["revenue"].sum() if not current_df.empty else pd.Series(dtype=float)
    baseline = baseline_df.groupby(baseline_df["timestamp"].dt.hour)["revenue"].sum() if not baseline_df.empty else pd.Series(dtype=float)

    output = []
    for hour in range(6, 23):
        baseline_avg = float(baseline.get(hour, 0.0) / baseline_days) if baseline_days else 0.0
        output.append(
            {
                "hour": f"{hour:02d}:00",
                "revenue": round(float(current.get(hour, 0.0)), 2),
                "baseline": round(baseline_avg, 2),
            }
        )
    return output


def detect_observations(current_df: pd.DataFrame, baseline_df: pd.DataFrame, baseline_days: int) -> list[dict]:
    observations: list[dict] = []
    if current_df.empty or baseline_df.empty or baseline_days <= 0:
        return observations

    current_item_rev = current_df.groupby("item")["revenue"].sum()
    baseline_item_rev_avg = baseline_df.groupby("item")["revenue"].sum() / baseline_days

    for item, value in current_item_rev.items():
        expected = float(baseline_item_rev_avg.get(item, 0.0))
        if expected <= 100:
            continue
        deviation = ((float(value) - expected) / expected) * 100
        if abs(deviation) >= 25:
            direction = "above" if deviation > 0 else "below"
            observations.append(
                {
                    "title": item.upper(),
                    "severity": "high" if abs(deviation) >= 35 else "medium",
                    "explanation": f"Sales are {abs(deviation):.0f}% {direction} the recent {baseline_days}-day average.",
                }
            )

    current_store_orders = current_df.groupby("store").size()
    baseline_store_orders_avg = baseline_df.groupby("store").size() / baseline_days
    for store, value in current_store_orders.items():
        expected = float(baseline_store_orders_avg.get(store, 0))
        if expected <= 10:
            continue
        deviation = ((float(value) - expected) / expected) * 100
        if deviation <= -15:
            observations.append(
                {
                    "title": store.upper(),
                    "severity": "medium",
                    "explanation": f"Orders are {abs(deviation):.0f}% below the recent {baseline_days}-day average.",
                }
            )

    observations.sort(key=lambda obs: {"high": 2, "medium": 1, "low": 0}.get(obs["severity"], 0), reverse=True)
    return observations[:5]
