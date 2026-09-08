from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.seed_data import seed_demo_data

router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/health")
def health():
    return {"status": "ok", "app": "Sidebrew"}


@router.post("/seed")
def seed(db: Session = Depends(get_db)):
    return seed_demo_data(db)
