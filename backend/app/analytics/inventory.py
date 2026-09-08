from __future__ import annotations

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import timedelta

from ..models.inventory import InventoryItem
from ..models.sales import Sale

INGREDIENT_USAGE_MAP: dict[str, dict[str, float]] = {
    "Milk": {
        "Cappuccino": 0.18,
        "Latte": 0.22,
        "Flat White": 0.16,
        "Cold Coffee": 0.28,
        "Mocha": 0.18,
        "Masala Chai": 0.12,
        "Iced Latte": 0.24,
    },
    "Coffee Beans": {
        "Espresso": 0.018,
        "Cappuccino": 0.018,
        "Latte": 0.018,
        "Flat White": 0.018,
        "Cold Coffee": 0.016,
        "Mocha": 0.018,
        "Americano": 0.018,
        "Iced Latte": 0.018,
    },
    "Chocolate Syrup": {"Mocha": 0.03, "Hot Chocolate": 0.04, "Cold Coffee": 0.02},
    "Tea Leaves": {"Masala Chai": 0.01},
    "Sugar": {
        "Cold Coffee": 0.015,
        "Masala Chai": 0.01,
        "Lemon Iced Tea": 0.012,
        "Hot Chocolate": 0.01,
    },
}


def inventory_risks(db: Session, lookback_days: int = 14) -> list[dict]:
    items = db.execute(select(InventoryItem)).scalars().all()
    if not items:
        return []

    latest_sale = db.execute(select(Sale.timestamp).order_by(Sale.timestamp.desc())).scalar()
    if latest_sale is None:
        sales_rows = []
    else:
        lookback_start = latest_sale - timedelta(days=lookback_days)
        sales_rows = db.execute(
            select(Sale.item, Sale.quantity).where(Sale.timestamp >= lookback_start, Sale.timestamp <= latest_sale)
        ).all()
    sales_df = pd.DataFrame(sales_rows, columns=["item", "quantity"]) if sales_rows else pd.DataFrame(columns=["item", "quantity"])

    risks = []
    for inventory in items:
        usage_map = INGREDIENT_USAGE_MAP.get(inventory.item, {})
        if sales_df.empty or not usage_map:
            avg_daily_usage = 0.0
        else:
            usage = 0.0
            for menu_item, unit_per_qty in usage_map.items():
                qty = float(sales_df.loc[sales_df["item"] == menu_item, "quantity"].sum())
                usage += qty * unit_per_qty
            avg_daily_usage = usage / max(lookback_days, 1)

        days_remaining = (inventory.current_quantity / avg_daily_usage) if avg_daily_usage > 0 else None
        reorder_recommended = (
            inventory.current_quantity <= inventory.reorder_threshold
            or (days_remaining is not None and days_remaining <= 1.2)
        )
        risks.append(
            {
                "item": inventory.item,
                "current_quantity": round(inventory.current_quantity, 2),
                "unit": inventory.unit,
                "average_daily_usage": round(avg_daily_usage, 2),
                "estimated_days_remaining": round(days_remaining, 1) if days_remaining is not None else None,
                "reorder_recommended": reorder_recommended,
                "supplier": inventory.supplier,
                "note": "Estimated from historical ingredient consumption.",
            }
        )

    risks.sort(key=lambda x: (not x["reorder_recommended"], x["estimated_days_remaining"] or 9999))
    return risks
