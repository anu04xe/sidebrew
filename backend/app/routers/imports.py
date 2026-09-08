from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.csv_import import import_sales_csv

router = APIRouter(prefix="/api/import", tags=["import"])


@router.post("/sales")
async def import_sales(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        payload = await file.read()
        return import_sales_csv(db, file.filename or "uploaded.csv", payload, persist=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Import failed due to a server error.")
