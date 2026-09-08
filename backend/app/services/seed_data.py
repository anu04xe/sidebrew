from __future__ import annotations

import random
from datetime import datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.inventory import InventoryItem
from ..models.sales import Sale


def seed_demo_data(db: Session) -> dict:
    existing = db.execute(select(Sale.id)).first()
    if existing:
        return {"inserted_sales": 0, "inserted_inventory": 0, "message": "Data already seeded"}

    random.seed(22)

    stores = ["Indiranagar", "Civil Lines", "Koregaon Park"]
    items = [
        ("Espresso", "Coffee", 120, 8),
        ("Cappuccino", "Coffee", 190, 14),
        ("Latte", "Coffee", 210, 14),
        ("Flat White", "Coffee", 210, 10),
        ("Cold Coffee", "Cold", 240, 13),
        ("Mocha", "Coffee", 230, 9),
        ("Americano", "Coffee", 150, 10),
        ("Iced Latte", "Cold", 230, 8),
        ("Masala Chai", "Tea", 90, 10),
        ("Lemon Iced Tea", "Tea", 160, 8),
        ("Hot Chocolate", "Chocolate", 180, 7),
        ("Blueberry Muffin", "Bakery", 130, 6),
        ("Croissant", "Bakery", 140, 5),
        ("Banana Bread", "Bakery", 150, 5),
        ("Veg Sandwich", "Food", 220, 7),
    ]

    start_date = datetime.utcnow().date() - timedelta(days=60)
    sales: list[Sale] = []

    for day_offset in range(60):
        day = start_date + timedelta(days=day_offset)
        is_weekend = day.weekday() >= 5
        for store in stores:
            store_multiplier = {
                "Indiranagar": 1.12,
                "Civil Lines": 0.96,
                "Koregaon Park": 1.04,
            }[store]

            for hour in range(7, 22):
                hour_weight = 0.7
                if 8 <= hour <= 11:
                    hour_weight = 1.4
                elif 17 <= hour <= 20:
                    hour_weight = 1.25

                if store == "Civil Lines" and day_offset > 48 and 17 <= hour <= 20:
                    hour_weight *= 0.72

                if is_weekend:
                    hour_weight *= 1.22

                for item, category, price, demand in items:
                    item_trend = 1.0
                    if item == "Cold Coffee" and day.weekday() == 4:
                        item_trend = 1.55
                    if item == "Cold Coffee" and store == "Indiranagar" and day.weekday() == 4:
                        item_trend = 1.28
                    if item == "Blueberry Muffin":
                        item_trend = max(0.45, 1 - (day_offset * 0.007))

                    noise = random.uniform(0.7, 1.3)
                    expected = demand * store_multiplier * hour_weight * item_trend * noise / 35
                    qty = int(expected)
                    if qty <= 0:
                        continue

                    order_count = max(1, qty // 2)
                    for _ in range(order_count):
                        ts = datetime.combine(day, time(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59)))
                        sales.append(
                            Sale(
                                timestamp=ts,
                                item=item,
                                category=category,
                                quantity=1,
                                unit_price=price,
                                payment_method=random.choice(["UPI", "Card", "Cash"]),
                                store=store,
                                order_type=random.choice(["Dine-in", "Takeaway"]),
                            )
                        )

    db.add_all(sales)

    inventory = [
        InventoryItem(item="Milk", current_quantity=9.0, unit="L", reorder_threshold=12.0, supplier="DairyDay"),
        InventoryItem(item="Coffee Beans", current_quantity=15.0, unit="kg", reorder_threshold=10.0, supplier="BeanCart"),
        InventoryItem(item="Chocolate Syrup", current_quantity=4.5, unit="L", reorder_threshold=3.0, supplier="CocoaHouse"),
        InventoryItem(item="Tea Leaves", current_quantity=6.0, unit="kg", reorder_threshold=4.0, supplier="LeafLane"),
        InventoryItem(item="Sugar", current_quantity=18.0, unit="kg", reorder_threshold=8.0, supplier="Sweetline"),
    ]
    db.add_all(inventory)
    db.commit()

    return {"inserted_sales": len(sales), "inserted_inventory": len(inventory), "message": "Synthetic demo data seeded"}
