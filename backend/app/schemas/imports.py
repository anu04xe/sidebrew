from datetime import datetime

from pydantic import BaseModel


class ImportPreviewRow(BaseModel):
    timestamp: datetime
    item: str
    category: str
    quantity: int
    unit_price: float
    payment_method: str
    store: str
    order_type: str


class InvalidRow(BaseModel):
    row_number: int
    reason: str


class ImportResult(BaseModel):
    file_name: str
    total_rows: int
    valid_rows: int
    warnings: int
    duplicates_skipped: int
    imported_rows: int
    invalid_rows: list[InvalidRow]
    preview: list[ImportPreviewRow]
