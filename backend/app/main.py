import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers.brief import router as brief_router
from .routers.imports import router as import_router
from .routers.meta import router as meta_router


# Create all tables on startup (safe to call repeatedly)
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Sidebrew")


# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the deployed Vercel frontend and local development environments.
#
# FRONTEND_URL can optionally contain additional comma-separated origins.
# Example:
# FRONTEND_URL=https://another-preview.vercel.app,https://custom-domain.com

_frontend_url = os.getenv("FRONTEND_URL", "")

_extra_origins = [
    origin.strip()
    for origin in _frontend_url.split(",")
    if origin.strip()
]

_allowed_origins = [
    "https://sidebrew.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
] + _extra_origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(meta_router)
app.include_router(import_router)
app.include_router(brief_router)
