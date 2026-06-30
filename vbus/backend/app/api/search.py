from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.bus import Route, Schedule, Trip, TripSeat, Stop, Bus, SeatStatus
from app.schemas import SearchResult, BusOut, StopOut

router = APIRouter()

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
            # seed seats
            bus = sched.bus
            seat_count = bus.total_seats
            seats = []
            half = seat_count // 2
            for i in range(1, seat_count + 1):
                deck = "lower" if i <= half else "upper"
                stype = "lower" if deck == "lower" else "upper"
                if bus.bus_type in ("seater", "luxury", "volvo"):
                    stype = "seater"
                    deck = "lower"
                # Reserve every 5th seat for women (ladies seat)
                is_ladies = (i % 5 == 0)
                seats.append(TripSeat(
                    trip_id=trip.id,
                    seat_number=str(i),
                    seat_type=stype,
                    deck=deck,
                    price=sched.base_price + (200 if deck == "lower" else 0),
                    status=SeatStatus.ladies if is_ladies else SeatStatus.available,
                    gender_lock="female" if is_ladies else None,
                ))
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
