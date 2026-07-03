from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float, ForeignKey, Date, Time, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class BusType(str, enum.Enum):
    sleeper   = "sleeper"
    semi_sleeper = "semi_sleeper"
    seater    = "seater"
    luxury    = "luxury"
    volvo     = "volvo"

class SeatStatus(str, enum.Enum):
    available = "available"
    booked    = "booked"
    locked    = "locked"
    ladies    = "ladies"

class BookingStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class Bus(Base):
    __tablename__ = "buses"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), nullable=False)
    number       = Column(String(20), unique=True, nullable=False)
    bus_type     = Column(Enum(BusType), nullable=False)
    total_seats  = Column(Integer, nullable=False)
    amenities    = Column(JSON, default=list)   # ["wifi","charging","ac","blanket"]
    layout       = Column(JSON, nullable=True)  # {decks,rows,left,right,kind,ladies}
    image_url    = Column(String(500), nullable=True)
    rating       = Column(Float, default=4.2)
    is_active    = Column(Boolean, default=True)
    schedules    = relationship("Schedule", back_populates="bus")

class Stop(Base):
    __tablename__ = "stops"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(100), nullable=False)
    city     = Column(String(100), nullable=False)
    state    = Column(String(100), nullable=False)
    lat      = Column(Float, nullable=True)
    lng      = Column(Float, nullable=True)

class Route(Base):
    __tablename__ = "routes"
    id             = Column(Integer, primary_key=True, index=True)
    origin_id      = Column(Integer, ForeignKey("stops.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("stops.id"), nullable=False)
    distance_km    = Column(Float, nullable=False)
    duration_hrs   = Column(Float, nullable=False)
    origin         = relationship("Stop", foreign_keys=[origin_id])
    destination    = relationship("Stop", foreign_keys=[destination_id])
    schedules      = relationship("Schedule", back_populates="route")

class Schedule(Base):
    __tablename__ = "schedules"
    id             = Column(Integer, primary_key=True, index=True)
    bus_id         = Column(Integer, ForeignKey("buses.id"), nullable=False)
    route_id       = Column(Integer, ForeignKey("routes.id"), nullable=False)
    departure_time = Column(Time, nullable=False)
    arrival_time   = Column(Time, nullable=False)
    base_price     = Column(Float, nullable=False)
    is_active      = Column(Boolean, default=True)
    bus            = relationship("Bus", back_populates="schedules")
    route          = relationship("Route", back_populates="schedules")
    trips          = relationship("Trip", back_populates="schedule")

class Trip(Base):
    __tablename__ = "trips"
    id           = Column(Integer, primary_key=True, index=True)
    schedule_id  = Column(Integer, ForeignKey("schedules.id"), nullable=False)
    travel_date  = Column(Date, nullable=False)
    status       = Column(String(20), default="active")
    schedule     = relationship("Schedule", back_populates="trips")
    seats        = relationship("TripSeat", back_populates="trip")
    bookings     = relationship("Booking", back_populates="trip")

class TripSeat(Base):
    __tablename__ = "trip_seats"
    id          = Column(Integer, primary_key=True, index=True)
    trip_id     = Column(Integer, ForeignKey("trips.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    seat_type   = Column(String(20), default="seater")   # seater / lower / upper
    deck        = Column(String(10), default="lower")
    status      = Column(Enum(SeatStatus), default=SeatStatus.available)
    gender_lock = Column(String(10), nullable=True)
    price       = Column(Float, nullable=False)
    trip        = relationship("Trip", back_populates="seats")

class Booking(Base):
    __tablename__ = "bookings"
    id             = Column(Integer, primary_key=True, index=True)
    pnr            = Column(String(12), unique=True, nullable=False)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_id        = Column(Integer, ForeignKey("trips.id"), nullable=False)
    status         = Column(Enum(BookingStatus), default=BookingStatus.pending)
    total_amount   = Column(Float, nullable=False)
    payment_id     = Column(String(100), nullable=True)
    passenger_info = Column(JSON, nullable=False)   # list of {name, age, gender, seat}
    boarding_stop  = Column(String(100), nullable=True)
    dropping_stop  = Column(String(100), nullable=True)
    booked_at      = Column(DateTime(timezone=True), server_default=func.now())
    user           = relationship("User", back_populates="bookings")
    trip           = relationship("Trip", back_populates="bookings")
