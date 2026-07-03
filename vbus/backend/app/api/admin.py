from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import time as dtime
from app.core.database import get_db
from app.core.security import get_admin_user
from app.models.user import User
from app.models.bus import Bus, Stop, Route, Schedule, Trip, TripSeat, Booking, SeatStatus, BookingStatus
from app.schemas import (
    BusOut, StopOut, StopCreate, BusCreate, RouteCreate, ScheduleCreate,
    BookingDetail, UserOut, LayoutUpdate,
)
from app.kafka.producer import publish_booking_event, publish_seat_event

router = APIRouter()

def _parse_time(s: str) -> dtime:
    h, m = map(int, s.split(":")[:2])
    return dtime(h, m)

# ── Dashboard stats ──────────────────────────────────────────────────────────
@router.get("/stats")
def stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return {
        "users": db.query(User).count(),
        "buses": db.query(Bus).count(),
        "stops": db.query(Stop).count(),
        "routes": db.query(Route).count(),
        "schedules": db.query(Schedule).count(),
        "trips": db.query(Trip).count(),
        "bookings": db.query(Booking).count(),
        "revenue": float(db.query(func.coalesce(func.sum(Booking.total_amount), 0)).scalar() or 0),
    }

# ── Stops ────────────────────────────────────────────────────────────────────
@router.get("/stops", response_model=List[StopOut])
def list_stops(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Stop).order_by(Stop.city).all()

@router.post("/stops", response_model=StopOut)
def create_stop(data: StopCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    stop = Stop(**data.dict())
    db.add(stop); db.commit(); db.refresh(stop)
    return stop

# ── Buses ────────────────────────────────────────────────────────────────────
@router.get("/buses", response_model=List[BusOut])
def list_buses(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Bus).all()

@router.post("/buses", response_model=BusOut)
def create_bus(data: BusCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if db.query(Bus).filter(Bus.number == data.number).first():
        raise HTTPException(400, "A bus with this number already exists")
    payload = data.dict()
    if not payload.get("total_seats"):
        lay = payload.get("layout") or {}
        decks = int(lay.get("decks") or 1); rows = int(lay.get("rows") or 0)
        per_row = int(lay.get("left") or 0) + int(lay.get("right") or 0)
        payload["total_seats"] = (decks * rows * per_row) or 40
    bus = Bus(**payload)
    db.add(bus); db.commit(); db.refresh(bus)
    return bus

@router.delete("/buses/{bus_id}")
def delete_bus(bus_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(404, "Bus not found")
    bus.is_active = False   # soft delete (keeps history intact)
    db.commit()
    return {"message": "Bus deactivated"}

@router.patch("/buses/{bus_id}/layout", response_model=BusOut)
def update_layout(bus_id: int, data: LayoutUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(404, "Bus not found")
    bus.layout = data.layout
    # keep total_seats in sync with the layout
    lay = data.layout or {}
    decks = int(lay.get("decks") or 1); rows = int(lay.get("rows") or 0)
    per_row = int(lay.get("left") or 0) + int(lay.get("right") or 0)
    if rows and per_row:
        bus.total_seats = decks * rows * per_row
    db.commit(); db.refresh(bus)
    return bus

# ── Routes ───────────────────────────────────────────────────────────────────
@router.get("/routes")
def list_routes(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    routes = db.query(Route).all()
    return [{"id": r.id, "origin": r.origin.city, "destination": r.destination.city,
             "origin_id": r.origin_id, "destination_id": r.destination_id,
             "distance_km": r.distance_km, "duration_hrs": r.duration_hrs} for r in routes]

@router.post("/routes")
def create_route(data: RouteCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if data.origin_id == data.destination_id:
        raise HTTPException(400, "Origin and destination must differ")
    for sid in (data.origin_id, data.destination_id):
        if not db.query(Stop).filter(Stop.id == sid).first():
            raise HTTPException(400, f"Stop {sid} not found")
    route = Route(**data.dict())
    db.add(route); db.commit(); db.refresh(route)
    return {"id": route.id, "origin": route.origin.city, "destination": route.destination.city}

# ── Schedules (a "trip/service" = bus + route + time + price) ─────────────────
@router.get("/schedules")
def list_schedules(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    out = []
    for s in db.query(Schedule).all():
        out.append({
            "id": s.id, "bus": s.bus.name, "bus_id": s.bus_id,
            "route": f"{s.route.origin.city} → {s.route.destination.city}", "route_id": s.route_id,
            "departure_time": str(s.departure_time)[:5], "arrival_time": str(s.arrival_time)[:5],
            "base_price": s.base_price, "is_active": s.is_active,
        })
    return out

@router.post("/schedules")
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if not db.query(Bus).filter(Bus.id == data.bus_id).first():
        raise HTTPException(400, "Bus not found")
    if not db.query(Route).filter(Route.id == data.route_id).first():
        raise HTTPException(400, "Route not found")
    sched = Schedule(
        bus_id=data.bus_id, route_id=data.route_id,
        departure_time=_parse_time(data.departure_time),
        arrival_time=_parse_time(data.arrival_time),
        base_price=data.base_price,
    )
    db.add(sched); db.commit(); db.refresh(sched)
    return {"id": sched.id, "message": "Trip/service added"}

@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    sched = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not sched:
        raise HTTPException(404, "Schedule not found")
    sched.is_active = False
    db.commit()
    return {"message": "Schedule deactivated"}

# ── Bookings & Users (read-only oversight) ────────────────────────────────────
@router.get("/bookings", response_model=List[BookingDetail])
def all_bookings(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Booking).order_by(Booking.booked_at.desc()).limit(200).all()

@router.post("/bookings/{booking_id}/confirm", response_model=BookingDetail)
def confirm_booking(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status == BookingStatus.cancelled:
        raise HTTPException(400, "Booking is cancelled")
    b.status = BookingStatus.confirmed
    db.commit(); db.refresh(b)
    publish_booking_event("booking_confirmed", b)
    return b

@router.post("/bookings/{booking_id}/reject", response_model=BookingDetail)
def reject_booking(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    b.status = BookingStatus.cancelled
    seat_numbers = [p["seat_number"] for p in (b.passenger_info or [])]
    if seat_numbers:
        db.query(TripSeat).filter(
            TripSeat.trip_id == b.trip_id,
            TripSeat.seat_number.in_(seat_numbers),
        ).update({"status": SeatStatus.available}, synchronize_session=False)
    db.commit(); db.refresh(b)
    publish_booking_event("booking_rejected", b)
    publish_seat_event("seat_released", b.trip_id, seat_numbers)
    return b

@router.post("/bookings/{booking_id}/confirm", response_model=BookingDetail)
def confirm_booking(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status == BookingStatus.cancelled:
        raise HTTPException(400, "Booking is cancelled")
    b.status = BookingStatus.confirmed
    db.commit(); db.refresh(b)
    publish_booking_event("booking_confirmed", b)
    return b

@router.post("/bookings/{booking_id}/reject", response_model=BookingDetail)
def reject_booking(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    b.status = BookingStatus.cancelled
    seat_numbers = [p["seat_number"] for p in (b.passenger_info or [])]
    if seat_numbers:
        db.query(TripSeat).filter(
            TripSeat.trip_id == b.trip_id,
            TripSeat.seat_number.in_(seat_numbers),
        ).update({"status": SeatStatus.available}, synchronize_session=False)
    db.commit(); db.refresh(b)
    publish_booking_event("booking_rejected", b)
    publish_seat_event("seat_released", b.trip_id, seat_numbers)
    return b

@router.get("/users", response_model=List[UserOut])
def all_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()
