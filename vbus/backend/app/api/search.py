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
    """Create TripSeat rows from a bus's layout config.

    layout = {decks:1|2, rows:int, left:int, right:int, kind:'seater'|'sleeper', ladies:int}
    Falls back to a 2+2 seater / sleeper split derived from total_seats.
    """
    layout = bus.layout or {}
    kind = layout.get("kind") or ("sleeper" if bus.bus_type in ("sleeper", "semi_sleeper") else "seater")
    left = int(layout.get("left") or 2)
    right = int(layout.get("right") or 2)
    decks = int(layout.get("decks") or (2 if kind == "sleeper" else 1))
    per_row = max(1, left + right)
    total = bus.total_seats or (per_row * 10 * decks)
    rows = int(layout.get("rows") or -(-total // (per_row * decks)))  # ceil
    ladies = int(layout.get("ladies") if layout.get("ladies") is not None else max(2, total // 8))
    fares = layout.get("fares") or {}                                  # {seater/lower/upper: price}
    blocked = {str(x).strip() for x in (layout.get("blocked") or [])}  # seat numbers to block

    def fare_for(deck):
        category = "seater" if kind == "seater" else deck   # 'lower' / 'upper'
        val = fares.get(category)
        if val not in (None, "", 0, "0"):
            try:
                return float(val)
            except (TypeError, ValueError):
                pass
        return base_price + (150 if (kind == "sleeper" and deck == "lower") else 0)

    deck_names = ["lower"] if decks == 1 else ["lower", "upper"]
    seats, n = [], 0
    for deck in deck_names:
        price = fare_for(deck)
        for _r in range(rows):
            for _c in range(per_row):
                n += 1
                seats.append(TripSeat(
                    trip_id=trip_id,
                    seat_number=str(n),
                    seat_type=kind,
                    deck=deck,
                    price=price,
                    status=SeatStatus.locked if str(n) in blocked else SeatStatus.available,
                ))
    # reserve some available seats for women (spread across the bus)
    if ladies > 0:
        avail = [s for s in seats if s.status == SeatStatus.available]
        step = max(1, len(avail) // ladies)
        for s in avail[::step]:
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
