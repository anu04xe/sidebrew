from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..reports.pdf import generate_brief_pdf
from ..services.brief_builder import build_copy_brief, build_morning_brief

router = APIRouter(prefix="/api/brief", tags=["brief"])


@router.get("/latest")
def latest_brief(store: str | None = Query(default=None), db: Session = Depends(get_db)):
    try:
        return build_morning_brief(db, store)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not generate morning brief right now.")


@router.get("/copy")
def copy_brief_text(store: str | None = Query(default=None), db: Session = Depends(get_db)):
    try:
        brief = build_morning_brief(db, store)
        return {"text": build_copy_brief(brief)}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not prepare copy brief text.")


@router.get("/pdf")
def brief_pdf(store: str | None = Query(default=None), db: Session = Depends(get_db)):
    from fastapi.responses import Response

    try:
        brief = build_morning_brief(db, store)
        content = generate_brief_pdf(brief)
        return Response(content, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=sidebrew-brief.pdf"})
    except Exception:
        raise HTTPException(status_code=500, detail="Could not export PDF right now.")
