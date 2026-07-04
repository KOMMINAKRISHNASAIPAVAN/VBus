from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.bus import TripSeat, Trip, Schedule, Route, RouteStop, Stop, SeatStatus
from app.schemas import SeatOut

router = APIRouter()

def _segment_fare(db: Session, schedule: Schedule, boarding: str, dropping: str, seat_type: str) -> Optional[float]:
    """Return fare for a boarding→dropping segment from RouteStop fares, or None if not configured."""
    route: Route = schedule.route
    stops = db.query(RouteStop).filter(RouteStop.route_id == route.id).order_by(RouteStop.sequence).all()
    if not stops:
        return None

    # find sequence numbers for boarding and dropping stops
    board_seq = drop_seq = None
    for rs in stops:
        city = (rs.stop.city or '').lower()
        if city == boarding.lower() and board_seq is None:
            board_seq = rs.sequence
        if city == dropping.lower() and drop_seq is None:
            drop_seq = rs.sequence

    # also check origin/destination of route itself
    if board_seq is None and (route.origin.city or '').lower() == boarding.lower():
        board_seq = -1
    if drop_seq is None and (route.destination.city or '').lower() == dropping.lower():
        drop_seq = 9999

    if board_seq is None or drop_seq is None:
        return None

    # find the RouteStop for the dropping point and read its fare
    for rs in stops:
        if rs.sequence == drop_seq:
            if seat_type in ('lower', 'sleeper') and rs.fare_sleeper:
                return float(rs.fare_sleeper)
            if seat_type in ('seater',) and rs.fare_seater:
                return float(rs.fare_seater)
            if seat_type == 'upper' and rs.fare_sleeper:
                return float(rs.fare_sleeper) * 0.9  # UB slightly cheaper
    return None


@router.get("/{trip_id}", response_model=List[SeatOut])
def get_seats(
    trip_id: int,
    boarding: Optional[str] = Query(None),
    dropping: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    seats = db.query(TripSeat).filter(TripSeat.trip_id == trip_id).all()

    # If boarding+dropping provided, adjust prices based on RouteStop segment fares
    if boarding and dropping:
        schedule = trip.schedule
        for seat in seats:
            seg_fare = _segment_fare(db, schedule, boarding, dropping, seat.seat_type)
            if seg_fare is not None:
                seat.price = seg_fare

    return seats
