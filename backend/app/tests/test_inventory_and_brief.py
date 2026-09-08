from app.analytics.inventory import inventory_risks
from app.models.inventory import InventoryItem
from app.models.sales import Sale
from app.services.brief_builder import build_morning_brief


def test_inventory_reorder_and_brief_fallback(db_session):
    from datetime import datetime

    db_session.add(
        InventoryItem(item="Milk", current_quantity=3.0, unit="L", reorder_threshold=8.0, supplier="DairyDay")
    )
    db_session.add(
        Sale(timestamp=datetime(2026, 9, 8, 8, 0, 0), item="Cold Coffee", category="Cold", quantity=20, unit_price=240, payment_method="UPI", store="Indiranagar", order_type="Dine-in")
    )
    db_session.commit()

    risks = inventory_risks(db_session)
    assert risks[0]["item"] == "Milk"
    assert risks[0]["reorder_recommended"] is True

    brief = build_morning_brief(db_session)
    assert "GOOD MORNING" in brief["narrative"]
