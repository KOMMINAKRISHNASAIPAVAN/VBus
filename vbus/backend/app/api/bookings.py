import random, string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bus import Booking, Trip, TripSeat, SeatStatus, BookingStatus
from app.schemas import BookingCreate, BookingOut, BookingDetail
from app.kafka.producer import publish_booking_event, publish_seat_event

router = APIRouter()

def gen_pnr():
    return "VB" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

@router.post("/", response_model=BookingDetail)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = db.query(Trip).filter(Trip.id == data.trip_id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    seat_numbers = [p.seat_number for p in data.passengers]
    gender_by_seat = {p.seat_number: (p.gender or "").lower() for p in data.passengers}
    seats = db.query(TripSeat).filter(
        TripSeat.trip_id == data.trip_id,
        TripSeat.seat_number.in_(seat_numbers),
    ).all()

    if len(seats) != len(seat_numbers):
        raise HTTPException(400, "One or more seats not found")

    for seat in seats:
        if seat.status in (SeatStatus.booked, SeatStatus.locked):
            raise HTTPException(400, f"Seat {seat.seat_number} is not available")
        # Ladies seats can only be booked by a female passenger
        if seat.status == SeatStatus.ladies and gender_by_seat.get(seat.seat_number) != "female":
            raise HTTPException(400, f"Seat {seat.seat_number} is reserved for women — only a female passenger can book it.")

    # Adjacent-seat safety: a male cannot sit beside a female passenger.
    # Seats are paired (1,2)(3,4)(5,6)... → partner of n is n+1 if odd else n-1.
    existing_booked = db.query(TripSeat).filter(
        TripSeat.trip_id == data.trip_id,
        TripSeat.status == SeatStatus.booked,
    ).all()
    existing_gender = {s.seat_number: (s.gender_lock or "").lower() for s in existing_booked}

    def _partner(sn):
        try:
            n = int(sn)
        except (TypeError, ValueError):
            return None
        return str(n + 1 if n % 2 == 1 else n - 1)

    def _occupant_gender(sn):
        if sn in gender_by_seat:
            return gender_by_seat[sn]
        return existing_gender.get(sn)

    for p in data.passengers:
        if (p.gender or "").lower() == "male":
            partner = _partner(p.seat_number)
            if partner and _occupant_gender(partner) == "female":
                raise HTTPException(400, f"Seat {p.seat_number} is beside a female passenger — only a female can book it.")

    total = sum(s.price for s in seats)

    # mark seats as booked and record occupant gender (for future adjacency checks)
    for seat in seats:
        seat.status = SeatStatus.booked
        seat.gender_lock = gender_by_seat.get(seat.seat_number)

    booking = Booking(
        pnr=gen_pnr(),
        user_id=current_user.id,
        trip_id=data.trip_id,
        status=BookingStatus.confirmed,
        total_amount=total,
        passenger_info=[p.dict() for p in data.passengers],
        boarding_stop=data.boarding_stop,
        dropping_stop=data.dropping_stop,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Emit events (no-op if no Kafka broker is running)
    publish_booking_event("booking_created", booking)
    publish_seat_event("seat_booked", booking.trip_id, seat_numbers)

    return booking

@router.get("/my", response_model=List[BookingDetail])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.booked_at.desc()).all()

@router.get("/{pnr}", response_model=BookingDetail)
def get_booking(pnr: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.pnr == pnr).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    return booking

@router.post("/{booking_id}/cancel", response_model=BookingDetail)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id,
    ).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status == BookingStatus.cancelled:
        raise HTTPException(400, "Already cancelled")

    booking.status = BookingStatus.cancelled
    # release seats
    seat_numbers = [p["seat_number"] for p in booking.passenger_info]
    db.query(TripSeat).filter(
        TripSeat.trip_id == booking.trip_id,
        TripSeat.seat_number.in_(seat_numbers),
    ).update({"status": SeatStatus.available}, synchronize_session=False)
    db.commit()
    db.refresh(booking)

    # Emit events (no-op if no Kafka broker is running)
    publish_booking_event("booking_cancelled", booking)
    publish_seat_event("seat_released", booking.trip_id, seat_numbers)

    return booking
