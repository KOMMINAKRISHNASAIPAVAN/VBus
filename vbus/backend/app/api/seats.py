from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.bus import TripSeat, Trip, SeatStatus
from app.schemas import SeatOut

router = APIRouter()

@router.get("/{trip_id}", response_model=List[SeatOut])
def get_seats(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    seats = db.query(TripSeat).filter(TripSeat.trip_id == trip_id).all()
    return seats
