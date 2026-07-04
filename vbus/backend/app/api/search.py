from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.bus import Route, Schedule, Trip, TripSeat, Stop, Bus, SeatStatus
from app.schemas import SearchResult, BusOut, StopOut

router = APIRouter()


def _build_seats_for_trip(trip_id: int, bus, base_price: float):
    layout = bus.layout or {}
    kind   = layout.get("kind") or ("sleeper" if bus.bus_type in ("sleeper", "semi_sleeper") else "seater")
    left   = int(layout.get("left") or 2)
    right  = int(layout.get("right") or 2)
    rows   = int(layout.get("rows") or 10)
    ladies = int(layout.get("ladies") or 0)
    fares  = layout.get("fares") or {}
    blocked = {str(x).strip() for x in (layout.get("blocked") or [])}

    def fare(key, fallback):
        v = fares.get(key)
        if v not in (None, "", 0, "0"):
            try: return float(v)
            except: pass
        return fallback

    seats, n = [], 0

    if kind == "seater":
        # All seats are seater, single deck
        price = fare("seater", base_price)
        for _r in range(rows):
            for _c in range(left + right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="seater", deck="lower", price=price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))

    elif kind == "sleeper":
        # All columns: LB (lower) + UB (upper) per row
        lb_price = fare("lower", base_price)
        ub_price = fare("upper", base_price + 100)
        for _r in range(rows):
            for _c in range(left + right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="lower", deck="lower", price=lb_price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))
            for _c in range(left + right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="upper", deck="upper", price=ub_price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))

    elif kind == "semi_sleeper":
        # Left cols: LB (lower) + UB (upper) per row
        # Right cols: Seater (lower) + UB (upper) per row
        lb_price     = fare("lower",  base_price + 50)
        ub_price     = fare("upper",  base_price + 100)
        seater_price = fare("seater", base_price)
        for _r in range(rows):
            # LB row — left cols only
            for _c in range(left):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="lower", deck="lower", price=lb_price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))
            # Seater row — right cols only
            for _c in range(right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="seater", deck="lower", price=seater_price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))
            # UB row — all cols (left + right)
            for _c in range(left + right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="upper", deck="upper", price=ub_price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))

    else:
        # fallback: plain seater
        price = fare("seater", base_price)
        for _r in range(rows):
            for _c in range(left + right):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id, seat_number=str(n),
                    seat_type="seater", deck="lower", price=price,
                    status=SeatStatus.blocked if str(n) in blocked else SeatStatus.available,
                ))

    # Mark ladies seats (first N available seats)
    if ladies > 0:
        avail = [s for s in seats if s.status == SeatStatus.available]
        for s in avail[:ladies]:
            s.status = SeatStatus.ladies
            s.gender_lock = "female"

    return seats

@router.get("/", response_model=List[SearchResult])
def search_buses(
    origin: str = Query(...),
    destination: str = Query(...),
    travel_date: date = Query(...),
    passengers: int = Query(1),
    bus_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # find matching stops
    origin_stops = db.query(Stop).filter(
        func.lower(Stop.city).contains(origin.lower())
    ).all()
    dest_stops = db.query(Stop).filter(
        func.lower(Stop.city).contains(destination.lower())
    ).all()

    origin_ids = [s.id for s in origin_stops]
    dest_ids   = [s.id for s in dest_stops]

    if not origin_ids or not dest_ids:
        return []

    routes = db.query(Route).filter(
        Route.origin_id.in_(origin_ids),
        Route.destination_id.in_(dest_ids),
    ).all()

    route_ids = [r.id for r in routes]
    if not route_ids:
        return []

    schedules_q = db.query(Schedule).filter(
        Schedule.route_id.in_(route_ids),
        Schedule.is_active == True,
    )
    if bus_type:
        schedules_q = schedules_q.join(Bus).filter(Bus.bus_type == bus_type)
    schedules = schedules_q.all()

    results = []
    for sched in schedules:
        trip = db.query(Trip).filter(
            Trip.schedule_id == sched.id,
            Trip.travel_date == travel_date,
        ).first()
        if not trip:
            # auto-create trip for the date
            trip = Trip(schedule_id=sched.id, travel_date=travel_date)
            db.add(trip)
            db.commit()
            db.refresh(trip)
            # seed seats from the bus's configured layout (or a sensible default)
            bus = sched.bus
            seats = _build_seats_for_trip(trip.id, bus, sched.base_price)
            db.bulk_save_objects(seats)
            db.commit()

        avail = db.query(TripSeat).filter(
            TripSeat.trip_id == trip.id,
            TripSeat.status == SeatStatus.available,
        ).count()

        if avail < passengers:
            continue

        route = sched.route
        results.append(SearchResult(
            trip_id=trip.id,
            schedule_id=sched.id,
            bus=BusOut.from_orm(sched.bus),
            origin=StopOut.from_orm(route.origin),
            destination=StopOut.from_orm(route.destination),
            departure_time=str(sched.departure_time)[:5],
            arrival_time=str(sched.arrival_time)[:5],
            duration_hrs=route.duration_hrs,
            distance_km=route.distance_km,
            base_price=sched.base_price,
            available_seats=avail,
            travel_date=travel_date,
        ))

    return results

@router.get("/cities", response_model=List[str])
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(Stop.city).distinct().all()
    return [c[0] for c in cities]

@router.get("/stops", response_model=List[StopOut])
def list_stops(db: Session = Depends(get_db)):
    return db.query(Stop).all()
