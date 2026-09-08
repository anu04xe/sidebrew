from datetime import datetime

from pydantic import BaseModel


class KPI(BaseModel):
    label: str
    value: float
    formatted: str
    change_pct: float | None = None


class Observation(BaseModel):
    title: str
    explanation: str
    severity: str


class InventoryRisk(BaseModel):
    item: str
    current_quantity: float
    unit: str
    average_daily_usage: float
    estimated_days_remaining: float | None
    reorder_recommended: bool
    supplier: str
    note: str


class BriefResponse(BaseModel):
    generated_at: datetime
    synthetic_data_notice: str
    scope_store: str
    kpis: list[KPI]
    observations: list[Observation]
    actions: list[str]
    chart_series: list[dict]
    inventory_risks: list[InventoryRisk]
    narrative: str
