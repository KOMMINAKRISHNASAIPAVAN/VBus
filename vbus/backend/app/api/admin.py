from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import time as dtime
from app.core.database import get_db
from app.core.security import get_admin_user
from app.models.user import User
from app.models.bus import (
    Bus, Stop, Route, RouteStop, Schedule, Trip, TripSeat,
    Booking, SeatStatus, BookingStatus,
)
from app.schemas import (
    BusOut, StopOut, StopCreate, BusCreate, BusUpdate,
    RouteCreate, RouteStopCreate, RouteStopOut,
    ScheduleCreate, BookingDetail, UserOut,
    LayoutUpdate, AmountUpdate, SeatBlockRequest,
)
from app.kafka.producer import publish_booking_event, publish_seat_event

router = APIRouter()

def _parse_time(s: str) -> dtime:
    h, m = map(int, s.split(":")[:2])
    return dtime(h, m)

# ── Dashboard stats ──────────────────────────────────────────────────────────
@router.get("/stats")
def stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    total_seats   = db.query(func.coalesce(func.sum(Bus.total_seats), 0)).filter(Bus.is_active == True).scalar() or 0
    booked_seats  = db.query(TripSeat).filter(TripSeat.status == SeatStatus.booked).count()
    blocked_seats = db.query(TripSeat).filter(TripSeat.status == SeatStatus.blocked).count()
    avail_seats   = db.query(TripSeat).filter(TripSeat.status == SeatStatus.available).count()
    pending_bk    = db.query(Booking).filter(Booking.status == BookingStatus.pending).count()
    confirmed_bk  = db.query(Booking).filter(Booking.status == BookingStatus.confirmed).count()
    revenue       = float(db.query(func.coalesce(func.sum(Booking.total_amount), 0))
                          .filter(Booking.status == BookingStatus.confirmed).scalar() or 0)
    return {
        "users": db.query(User).count(),
        "buses": db.query(Bus).filter(Bus.is_active == True).count(),
        "stops": db.query(Stop).count(),
        "routes": db.query(Route).count(),
        "schedules": db.query(Schedule).count(),
        "trips": db.query(Trip).count(),
        "bookings": db.query(Booking).count(),
        "pending_bookings": pending_bk,
        "confirmed_bookings": confirmed_bk,
        "revenue": revenue,
        "total_seats": int(total_seats),
        "available_seats": avail_seats,
        "booked_seats": booked_seats,
        "blocked_seats": blocked_seats,
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

@router.delete("/stops/{stop_id}")
def delete_stop(stop_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(404, "Stop not found")
    db.delete(stop); db.commit()
    return {"message": "Stop deleted"}

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
        decks   = int(lay.get("decks") or 1)
        rows    = int(lay.get("rows") or 0)
        per_row = int(lay.get("left") or 0) + int(lay.get("right") or 0)
        payload["total_seats"] = (decks * rows * per_row) or 40
    bus = Bus(**payload)
    db.add(bus); db.commit(); db.refresh(bus)
    return bus

@router.patch("/buses/{bus_id}", response_model=BusOut)
def update_bus(bus_id: int, data: BusUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(404, "Bus not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(bus, k, v)
    db.commit(); db.refresh(bus)
    return bus

@router.delete("/buses/{bus_id}")
def delete_bus(bus_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(404, "Bus not found")
    bus.is_active = False
    db.commit()
    return {"message": "Bus deactivated"}

@router.patch("/buses/{bus_id}/layout", response_model=BusOut)
def update_layout(bus_id: int, data: LayoutUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(404, "Bus not found")
    bus.layout = data.layout
    lay = data.layout or {}
    decks   = int(lay.get("decks") or 1)
    rows    = int(lay.get("rows") or 0)
    per_row = int(lay.get("left") or 0) + int(lay.get("right") or 0)
    if rows and per_row:
        bus.total_seats = decks * rows * per_row
    db.commit(); db.refresh(bus)
    return bus

# ── Routes ───────────────────────────────────────────────────────────────────
@router.get("/routes")
def list_routes(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    routes = db.query(Route).all()
    result = []
    for r in routes:
        stops = [
            {
                "id": rs.id, "stop_id": rs.stop_id,
                "stop_city": rs.stop.city, "stop_name": rs.stop.name,
                "sequence": rs.sequence,
                "arrival_time": rs.arrival_time, "departure_time": rs.departure_time,
                "is_pickup": rs.is_pickup, "is_drop": rs.is_drop,
                "fare_seater": rs.fare_seater, "fare_sleeper": rs.fare_sleeper,
            }
            for rs in r.route_stops
        ]
        result.append({
            "id": r.id, "origin": r.origin.city, "destination": r.destination.city,
            "origin_id": r.origin_id, "destination_id": r.destination_id,
            "distance_km": r.distance_km, "duration_hrs": r.duration_hrs,
            "via_stops": r.via_stops or [],
            "route_stops": stops,
        })
    return result

@router.post("/routes")
def create_route(data: RouteCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if data.origin_id == data.destination_id:
        raise HTTPException(400, "Origin and destination must differ")
    for sid in (data.origin_id, data.destination_id):
        if not db.query(Stop).filter(Stop.id == sid).first():
            raise HTTPException(400, f"Stop {sid} not found")
    route = Route(
        origin_id=data.origin_id, destination_id=data.destination_id,
        distance_km=data.distance_km, duration_hrs=data.duration_hrs,
        via_stops=data.via_stops or [],
    )
    db.add(route); db.commit(); db.refresh(route)
    return {"id": route.id, "origin": route.origin.city, "destination": route.destination.city}

@router.delete("/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(404, "Route not found")
    db.delete(route); db.commit()
    return {"message": "Route deleted"}

# ── Route Stops (intermediate stops with pickup/drop/fares) ──────────────────
@router.get("/routes/{route_id}/stops")
def list_route_stops(route_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    rs_list = db.query(RouteStop).filter(RouteStop.route_id == route_id).order_by(RouteStop.sequence).all()
    return [
        {
            "id": rs.id, "route_id": rs.route_id, "stop_id": rs.stop_id,
            "stop_city": rs.stop.city, "stop_name": rs.stop.name,
            "sequence": rs.sequence,
            "arrival_time": rs.arrival_time, "departure_time": rs.departure_time,
            "is_pickup": rs.is_pickup, "is_drop": rs.is_drop,
            "fare_seater": rs.fare_seater, "fare_sleeper": rs.fare_sleeper,
        }
        for rs in rs_list
    ]

@router.post("/routes/{route_id}/stops")
def add_route_stop(route_id: int, data: RouteStopCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if not db.query(Route).filter(Route.id == route_id).first():
        raise HTTPException(404, "Route not found")
    if not db.query(Stop).filter(Stop.id == data.stop_id).first():
        raise HTTPException(404, "Stop not found")
    rs = RouteStop(route_id=route_id, **data.dict())
    db.add(rs); db.commit(); db.refresh(rs)
    return {"id": rs.id, "stop_city": rs.stop.city, "sequence": rs.sequence}

@router.patch("/routes/{route_id}/stops/{rs_id}")
def update_route_stop(route_id: int, rs_id: int, data: RouteStopCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    rs = db.query(RouteStop).filter(RouteStop.id == rs_id, RouteStop.route_id == route_id).first()
    if not rs:
        raise HTTPException(404, "Route stop not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(rs, k, v)
    db.commit(); db.refresh(rs)
    return {"id": rs.id, "stop_city": rs.stop.city}

@router.delete("/routes/{route_id}/stops/{rs_id}")
def delete_route_stop(route_id: int, rs_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    rs = db.query(RouteStop).filter(RouteStop.id == rs_id, RouteStop.route_id == route_id).first()
    if not rs:
        raise HTTPException(404, "Route stop not found")
    db.delete(rs); db.commit()
    return {"message": "Route stop removed"}

# ── Schedules ────────────────────────────────────────────────────────────────
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

# ── Seat Blocking ─────────────────────────────────────────────────────────────
@router.post("/seats/block")
def block_seats(data: SeatBlockRequest, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    new_status = SeatStatus.blocked if data.action == "block" else SeatStatus.available
    seats = db.query(TripSeat).filter(
        TripSeat.trip_id == data.trip_id,
        TripSeat.seat_number.in_(data.seat_numbers),
    ).all()
    if not seats:
        raise HTTPException(404, "No matching seats found")
    for s in seats:
        if data.action == "block" and s.status == SeatStatus.booked:
            raise HTTPException(400, f"Seat {s.seat_number} is already booked and cannot be blocked")
        s.status = new_status
    db.commit()
    return {"message": f"{len(seats)} seat(s) {data.action}ed", "seats": data.seat_numbers}

@router.get("/seats/{trip_id}")
def get_trip_seats(trip_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    seats = db.query(TripSeat).filter(TripSeat.trip_id == trip_id).order_by(TripSeat.seat_number).all()
    return [
        {
            "id": s.id, "seat_number": s.seat_number, "seat_type": s.seat_type,
            "deck": s.deck, "status": s.status, "price": s.price,
        }
        for s in seats
    ]

# ── Bookings ──────────────────────────────────────────────────────────────────
@router.get("/bookings")
def all_bookings(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    bookings = db.query(Booking).order_by(Booking.booked_at.desc()).limit(200).all()
    result = []
    for b in bookings:
        trip = db.query(Trip).filter(Trip.id == b.trip_id).first()
        bus_name = None
        if trip and trip.schedule:
            bus_name = trip.schedule.bus.name
        result.append({
            "id": b.id, "pnr": b.pnr, "status": b.status,
            "total_amount": b.total_amount, "passenger_info": b.passenger_info,
            "boarding_stop": b.boarding_stop, "dropping_stop": b.dropping_stop,
            "booked_at": b.booked_at, "trip_id": b.trip_id,
            "bus_name": bus_name,
        })
    return result

@router.patch("/bookings/{booking_id}/amount")
def update_booking_amount(booking_id: int, data: AmountUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status == BookingStatus.confirmed:
        raise HTTPException(400, "Fare is locked — booking is already confirmed")
    if b.status == BookingStatus.cancelled:
        raise HTTPException(400, "Cannot update a cancelled booking")
    b.total_amount = data.total_amount
    db.commit(); db.refresh(b)
    return {"id": b.id, "total_amount": b.total_amount}

@router.post("/bookings/{booking_id}/send_payment")
def send_payment_link(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin confirms price and sends payment link to user."""
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status not in (BookingStatus.pending,):
        raise HTTPException(400, f"Cannot send payment link for booking in status '{b.status}'")
    b.status = BookingStatus.payment_requested
    db.commit(); db.refresh(b)
    return b

@router.post("/bookings/{booking_id}/payment_received")
def payment_received(booking_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin marks payment as received and confirms the ticket."""
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status not in (BookingStatus.payment_done, BookingStatus.payment_requested):
        raise HTTPException(400, f"Cannot confirm payment for booking in status '{b.status}'")
    b.status = BookingStatus.confirmed
    db.commit(); db.refresh(b)
    publish_booking_event("booking_confirmed", b)
    return b

@router.post("/bookings/{booking_id}/confirm")
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

@router.post("/bookings/{booking_id}/reject")
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

# ── Users ─────────────────────────────────────────────────────────────────────
@router.get("/users", response_model=List[UserOut])
def all_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()
