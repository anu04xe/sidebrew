from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    item: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    current_quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(24))
    reorder_threshold: Mapped[float] = mapped_column(Float)
    supplier: Mapped[str] = mapped_column(String(120))
