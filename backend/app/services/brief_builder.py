from __future__ import annotations

from datetime import UTC, datetime, time, timedelta

from sqlalchemy.orm import Session

from ..ai.providers import BriefInput, DeterministicBriefProvider
from ..ai.service import select_brief_provider
from ..analytics.inventory import inventory_risks
from ..analytics.sales import (
    compare_against_baseline,
    detect_observations,
    hourly_rhythm,
    latest_sales_day,
    load_sales_between,
    summarize_period,
)


def _currency(value: float) -> str:
    return f"₹{value:,.0f}"


def _pct(value: float | None) -> str:
    if value is None:
        return "N/A"
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.1f}%"


def build_morning_brief(db: Session, store: str | None = None) -> dict:
    last_day = latest_sales_day(db)
    if not last_day:
        return {
            "generated_at": datetime.now(UTC),
            "synthetic_data_notice": "No sales data available yet. Import or seed synthetic data.",
            "scope_store": store or "All stores",
            "kpis": [],
            "observations": [],
            "actions": ["Import sales CSV to generate your first brief."],
            "chart_series": [],
            "inventory_risks": [],
            "narrative": "No data available.",
        }

    current_start = datetime.combine(last_day, time.min)
    current_end = current_start + timedelta(days=1)
    baseline_start = current_start - timedelta(days=7)

    current = load_sales_between(db, current_start, current_end, store)
    baseline = load_sales_between(db, baseline_start, current_start, store)

    current_stats = summarize_period(current.df)
    baseline_stats = summarize_period(baseline.df)

    baseline_days = len({d for d in baseline.df["timestamp"].dt.date}) if not baseline.df.empty else 0
    comparison = compare_against_baseline(current_stats, baseline_stats, baseline_days)

    observations = detect_observations(current.df, baseline.df, baseline_days)
    inventory = inventory_risks(db)

    if baseline_days == 0:
        baseline_note = "Insufficient historical data for baseline comparison."
    else:
        baseline_note = "Synthetic demo dataset for portfolio demonstration."

    actions = []
    for risk in inventory:
        if risk["reorder_recommended"]:
            actions.append(f"Reorder {risk['item'].lower()}")
    for obs in observations:
        if "below" in obs["explanation"]:
            actions.append(f"Review performance for {obs['title'].title()}")
        elif "above" in obs["explanation"]:
            actions.append(f"Monitor demand for {obs['title'].title()}")
    if not actions:
        actions = ["Keep standard staffing and monitor normal sales rhythm."]

    kpis = [
        {
            "label": "Revenue",
            "value": current_stats["revenue"],
            "formatted": _currency(current_stats["revenue"]),
            "change_pct": comparison["revenue_change_pct"],
        },
        {
            "label": "Orders",
            "value": float(current_stats["orders"]),
            "formatted": f"{current_stats['orders']}",
            "change_pct": comparison["orders_change_pct"],
        },
        {
            "label": "AOV",
            "value": current_stats["aov"],
            "formatted": _currency(current_stats["aov"]),
            "change_pct": comparison["aov_change_pct"],
        },
    ]

    day_label = current_start.strftime("%A").upper()
    brief_input = BriefInput(
        day_label=day_label,
        revenue_text=f"{_currency(current_stats['revenue'])} ({_pct(comparison['revenue_change_pct'])})",
        orders_text=f"{current_stats['orders']} ({_pct(comparison['orders_change_pct'])})",
        observations=[obs["explanation"] for obs in observations],
        actions=actions,
    )
    provider = select_brief_provider()
    try:
        narrative = provider.generate(brief_input)
    except Exception:
        narrative = DeterministicBriefProvider().generate(brief_input)

    # Coffee category detection — items whose category is 'Coffee' or name contains coffee keywords
    coffee_keywords = {"espresso", "cappuccino", "latte", "flat white", "cold coffee", "americano", "mocha", "iced latte"}
    coffee_order_count = 0
    if not current.df.empty:
        coffee_mask = (
            current.df["category"].str.lower().str.contains("coffee", na=False)
            | current.df["item"].str.lower().isin(coffee_keywords)
        )
        coffee_order_count = int(current.df.loc[coffee_mask, "quantity"].sum())

    # Busiest hour
    busiest_hour: str | None = None
    if current_stats["by_hour"]:
        best_h = max(current_stats["by_hour"], key=lambda h: current_stats["by_hour"][h])
        busiest_hour = f"{int(best_h):02d}:00–{int(best_h)+1:02d}:00"

    return {
        "generated_at": datetime.now(UTC),
        "synthetic_data_notice": baseline_note,
        "scope_store": store or "All stores",
        "kpis": kpis,
        "observations": observations,
        "actions": actions[:5],
        "chart_series": hourly_rhythm(current.df, baseline.df, baseline_days),
        "inventory_risks": inventory[:6],
        "narrative": narrative,
        # Extended fields for richer UI
        "top_products": current_stats["top_products"],  # dict item->quantity, top 5
        "by_category": current_stats["by_category"],    # dict category->revenue
        "busiest_hour": busiest_hour,
        "coffee_order_count": coffee_order_count,
    }


def build_copy_brief(brief: dict) -> str:
    day_label = brief["generated_at"].strftime("%A").upper()

    revenue = next((k for k in brief["kpis"] if k["label"] == "Revenue"), None)
    orders = next((k for k in brief["kpis"] if k["label"] == "Orders"), None)

    worth = [f"• {obs['explanation']}" for obs in brief["observations"][:3]]
    actions = [f"• {action}" for action in brief["actions"][:3]]

    return (
        f"GOOD MORNING · {day_label}\n\n"
        f"Revenue: {revenue['formatted']} ({_pct(revenue['change_pct'])})\n"
        f"Orders: {orders['formatted']} ({_pct(orders['change_pct'])})\n\n"
        "Worth noticing:\n"
        + ("\n".join(worth) if worth else "• No significant anomalies detected")
        + "\n\nToday's actions:\n"
        + ("\n".join(actions) if actions else "• Continue regular operations")
    )
