from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy import text
from app.api import auth, buses, routes, bookings, seats, users, search, admin
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings

Base.metadata.create_all(bind=engine)

# Lightweight idempotent migrations for pre-existing tables (MySQL & Postgres)
_is_pg = settings.DATABASE_URL.startswith("postgres")
_json_type = "JSONB" if _is_pg else "JSON"
for _stmt in (
    "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE",
    f"ALTER TABLE buses ADD COLUMN layout {_json_type}",
    f"ALTER TABLE buses ADD COLUMN operator VARCHAR(100)",
    f"ALTER TABLE routes ADD COLUMN via_stops {_json_type}",
):
    try:
        with engine.begin() as conn:
            conn.execute(text(_stmt))
    except Exception:
        pass  # column already present

# Ensure a default admin account exists (idempotent)
def _ensure_admin():
    from app.models.user import User
    from app.core.security import hash_password
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin_user is None:
            db.add(User(
                name="Administrator", email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                is_admin=True, is_active=True, is_verified=True,
            ))
        else:
            admin_user.is_admin = True
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

_ensure_admin()

_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app = FastAPI(
    title="VBus API",
    description="Modern bus booking platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials="*" not in _origins,  # credentials can't be used with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/api/users",    tags=["Users"])
app.include_router(buses.router,    prefix="/api/buses",    tags=["Buses"])
app.include_router(routes.router,   prefix="/api/routes",   tags=["Routes"])
app.include_router(search.router,   prefix="/api/search",   tags=["Search"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(seats.router,    prefix="/api/seats",    tags=["Seats"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "VBus API"}

# ---- Serve the built React frontend from the same service (single-URL deploy) ----
import os
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.isdir(_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = os.path.join(_DIST, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_DIST, "index.html"))  # SPA fallback
