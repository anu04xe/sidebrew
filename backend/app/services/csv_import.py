from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from io import BytesIO

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.sales import Sale
from ..schemas.imports import ImportPreviewRow, ImportResult, InvalidRow

REQUIRED_COLUMNS = {
    "timestamp",
    "item",
    "category",
    "quantity",
    "unit_price",
    "payment_method",
    "store",
    "order_type",
}


def _norm_str(value: object) -> str:
    return str(value).strip()


def _validate_row(raw: pd.Series, row_number: int) -> tuple[dict | None, str | None]:
    try:
        timestamp = pd.to_datetime(raw["timestamp"], errors="raise").to_pydatetime()
    except Exception:
        return None, "invalid timestamp"

    item = _norm_str(raw["item"])
    category = _norm_str(raw["category"])
    payment_method = _norm_str(raw["payment_method"])
    store = _norm_str(raw["store"])
    order_type = _norm_str(raw["order_type"])

    if not all([item, category, payment_method, store, order_type]):
        return None, "required text field is empty"

    try:
        quantity = int(raw["quantity"])
        if quantity <= 0:
            raise ValueError
    except Exception:
        return None, "invalid quantity"

    try:
        unit_price = float(raw["unit_price"])
        if unit_price <= 0:
            raise ValueError
    except Exception:
        return None, "invalid unit price"

    return {
        "timestamp": timestamp,
        "item": item,
        "category": category,
        "quantity": quantity,
        "unit_price": round(unit_price, 2),
        "payment_method": payment_method,
        "store": store,
        "order_type": order_type,
    }, None


def import_sales_csv(db: Session, file_name: str, content: bytes, persist: bool = True) -> ImportResult:
    if not content.strip():
        raise ValueError("The uploaded CSV is empty.")

    try:
        df = pd.read_csv(BytesIO(content))
    except Exception:
        raise ValueError("Unable to parse CSV. Please upload a valid CSV file.")

    if df.empty:
        raise ValueError("The uploaded CSV does not contain any rows.")

    missing = sorted(REQUIRED_COLUMNS - set(df.columns))
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    valid_rows: list[dict] = []
    invalid_rows: list[InvalidRow] = []

    for idx, row in df.iterrows():
        parsed, err = _validate_row(row, idx + 2)
        if err:
            invalid_rows.append(InvalidRow(row_number=idx + 2, reason=err))
            continue
        valid_rows.append(parsed)

    duplicates_skipped = 0
    to_insert: list[Sale] = []
    seen_keys: set[tuple] = set()

    for row in valid_rows:
        key = (
            row["timestamp"],
            row["item"],
            row["quantity"],
            row["unit_price"],
            row["store"],
            row["payment_method"],
            row["order_type"],
        )
        if key in seen_keys:
            duplicates_skipped += 1
            continue
        seen_keys.add(key)

        existing = db.execute(
            select(Sale.id).where(
                Sale.timestamp == row["timestamp"],
                Sale.item == row["item"],
                Sale.quantity == row["quantity"],
                Sale.unit_price == row["unit_price"],
                Sale.store == row["store"],
                Sale.payment_method == row["payment_method"],
                Sale.order_type == row["order_type"],
            )
        ).first()
        if existing:
            duplicates_skipped += 1
            continue

        to_insert.append(Sale(**row))

    if persist and to_insert:
        db.add_all(to_insert)
        db.commit()

    preview = [ImportPreviewRow(**row) for row in valid_rows[:8]]
    return ImportResult(
        file_name=file_name,
        total_rows=len(df.index),
        valid_rows=len(valid_rows),
        warnings=len(invalid_rows),
        duplicates_skipped=duplicates_skipped,
        imported_rows=len(to_insert),
        invalid_rows=invalid_rows[:20],
        preview=preview,
    )
