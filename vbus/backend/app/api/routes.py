from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.bus import Route

router = APIRouter()

@router.get("/")
def list_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    return [{"id": r.id, "origin": r.origin.city, "destination": r.destination.city,
             "distance_km": r.distance_km, "duration_hrs": r.duration_hrs} for r in routes]
