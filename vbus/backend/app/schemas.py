from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import date, time, datetime
from enum import Enum

# ── Auth ──────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr
    phone: str
    new_password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    gender: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    is_admin: bool = False
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

# ── Search ────────────────────────────────────────
class SearchQuery(BaseModel):
    origin: str
    destination: str
    travel_date: date
    passengers: int = 1

class BusOut(BaseModel):
    id: int
    name: str
    number: str
    bus_type: str
    total_seats: int
    amenities: List[str]
    rating: float
    image_url: Optional[str]
    layout: Optional[dict] = None
    operator: Optional[str] = None
    class Config: from_attributes = True

class StopOut(BaseModel):
    id: int
    name: str
    city: str
    state: str
    class Config: from_attributes = True

class SearchResult(BaseModel):
    trip_id: int
    schedule_id: int
    bus: BusOut
    origin: StopOut
    destination: StopOut
    departure_time: str
    arrival_time: str
    duration_hrs: float
    distance_km: float
    base_price: float
    available_seats: int
    travel_date: date

# ── Seats ─────────────────────────────────────────
class SeatOut(BaseModel):
    id: int
    seat_number: str
    seat_type: str
    deck: str
    status: str
    gender_lock: Optional[str]
    price: float
    class Config: from_attributes = True

# ── Bookings ──────────────────────────────────────
class PassengerInfo(BaseModel):
    name: str
    age: int
    gender: str
    seat_number: str
    phone: Optional[str] = None

class BookingCreate(BaseModel):
    trip_id: int
    passengers: List[PassengerInfo]
    boarding_stop: Optional[str] = None
    dropping_stop: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    pnr: str
    status: str
    total_amount: float
    passenger_info: Any
    boarding_stop: Optional[str]
    dropping_stop: Optional[str]
    requested_date: Optional[str] = None
    booked_at: datetime
    class Config: from_attributes = True

class BookingDetail(BookingOut):
    trip_id: int
    travel_date: Optional[str] = None
    class Config: from_attributes = True

# ── Stops ─────────────────────────────────────────
class StopCreate(BaseModel):
    name: str
    city: str
    state: str
    lat: Optional[float] = None
    lng: Optional[float] = None

# ── Route Stops ───────────────────────────────────
class RouteStopCreate(BaseModel):
    stop_id: int
    sequence: int
    arrival_time: Optional[str] = None
    departure_time: Optional[str] = None
    is_pickup: bool = True
    is_drop: bool = True
    fare_seater: Optional[float] = None
    fare_sleeper: Optional[float] = None

class RouteStopOut(BaseModel):
    id: int
    route_id: int
    stop_id: int
    stop_name: Optional[str] = None
    stop_city: Optional[str] = None
    sequence: int
    arrival_time: Optional[str]
    departure_time: Optional[str]
    is_pickup: bool
    is_drop: bool
    fare_seater: Optional[float]
    fare_sleeper: Optional[float]
    class Config: from_attributes = True

# ── Admin ─────────────────────────────────────────
class BusCreate(BaseModel):
    name: str
    number: str
    bus_type: str
    total_seats: Optional[int] = None
    amenities: List[str] = []
    rating: float = 4.2
    operator: Optional[str] = None
    layout: Optional[dict] = None

class BusUpdate(BaseModel):
    name: Optional[str] = None
    number: Optional[str] = None
    bus_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    rating: Optional[float] = None
    operator: Optional[str] = None
    is_active: Optional[bool] = None

class AmountUpdate(BaseModel):
    total_amount: float

class LayoutUpdate(BaseModel):
    layout: dict

class RouteCreate(BaseModel):
    origin_id: int
    destination_id: int
    distance_km: float
    duration_hrs: float
    via_stops: Optional[List[str]] = []

class ScheduleCreate(BaseModel):
    bus_id: int
    route_id: int
    departure_time: str
    arrival_time: str
    base_price: float

class SeatBlockRequest(BaseModel):
    seat_numbers: List[str]
    trip_id: int
    action: str  # "block" or "unblock"

class ChangeDateRequest(BaseModel):
    new_date: str  # YYYY-MM-DD
