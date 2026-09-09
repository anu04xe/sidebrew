import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers.brief import router as brief_router
from .routers.imports import router as import_router
from .routers.meta import router as meta_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sidebrew")
allowed_origins = ["http://localhost:5173"]
frontend_origin = os.getenv("FRONTEND_URL")
if frontend_origin:
    allowed_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meta_router)
app.include_router(import_router)
app.include_router(brief_router)
