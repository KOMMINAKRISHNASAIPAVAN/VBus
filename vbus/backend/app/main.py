from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.api import auth, buses, routes, bookings, seats, users, search
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
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

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "VBus API"}
