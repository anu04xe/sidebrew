from datetime import datetime, timedelta

from app.analytics.sales import compare_against_baseline, detect_observations, summarize_period
from app.models.sales import Sale


def test_sales_summary_and_comparison(db_session):
    now = datetime(2026, 9, 8, 8, 0, 0)
    db_session.add_all(
        [
            Sale(timestamp=now, item="Cold Coffee", category="Cold", quantity=2, unit_price=240, payment_method="UPI", store="Indiranagar", order_type="Dine-in"),
            Sale(timestamp=now, item="Latte", category="Coffee", quantity=1, unit_price=210, payment_method="Card", store="Indiranagar", order_type="Dine-in"),
        ]
    )
    db_session.commit()

    import pandas as pd

    current = pd.DataFrame(
        [
            {"timestamp": now, "item": "Cold Coffee", "category": "Cold", "quantity": 2, "unit_price": 240, "store": "Indiranagar", "revenue": 480},
            {"timestamp": now, "item": "Latte", "category": "Coffee", "quantity": 1, "unit_price": 210, "store": "Indiranagar", "revenue": 210},
        ]
    )
    baseline = pd.DataFrame(
        [
            {"timestamp": now - timedelta(days=1), "item": "Cold Coffee", "category": "Cold", "quantity": 1, "unit_price": 240, "store": "Indiranagar", "revenue": 240},
            {"timestamp": now - timedelta(days=2), "item": "Latte", "category": "Coffee", "quantity": 1, "unit_price": 210, "store": "Indiranagar", "revenue": 210},
        ]
    )

    current_summary = summarize_period(current)
    baseline_summary = summarize_period(baseline)
    comparison = compare_against_baseline(current_summary, baseline_summary, baseline_days=2)

    assert current_summary["revenue"] == 690.0
    assert current_summary["orders"] == 2
    assert current_summary["aov"] == 345.0
    assert comparison["revenue_change_pct"] == 206.7


def test_anomaly_detection(db_session):
    import pandas as pd

    now = datetime(2026, 9, 8, 8, 0, 0)
    current = pd.DataFrame(
        [
            {"timestamp": now, "item": "Cold Coffee", "category": "Cold", "quantity": 5, "unit_price": 240, "store": "Indiranagar", "revenue": 1200},
            {"timestamp": now, "item": "Latte", "category": "Coffee", "quantity": 1, "unit_price": 210, "store": "Civil Lines", "revenue": 210},
        ]
    )
    baseline = pd.DataFrame(
        [
            {"timestamp": now - timedelta(days=1), "item": "Cold Coffee", "category": "Cold", "quantity": 1, "unit_price": 240, "store": "Indiranagar", "revenue": 240},
            {"timestamp": now - timedelta(days=1), "item": "Latte", "category": "Coffee", "quantity": 4, "unit_price": 210, "store": "Civil Lines", "revenue": 840},
            {"timestamp": now - timedelta(days=2), "item": "Cold Coffee", "category": "Cold", "quantity": 1, "unit_price": 240, "store": "Indiranagar", "revenue": 240},
            {"timestamp": now - timedelta(days=2), "item": "Latte", "category": "Coffee", "quantity": 3, "unit_price": 210, "store": "Civil Lines", "revenue": 630},
        ]
    )

    observations = detect_observations(current, baseline, baseline_days=2)
    assert any("Cold Coffee".upper() in o["title"] for o in observations)
