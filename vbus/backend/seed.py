"""Run: python seed.py  — wipes & repopulates the vbus MySQL database with demo data"""
import sys
sys.path.insert(0, ".")
from datetime import time as dtime
from app.core.database import SessionLocal, engine, Base
from app.models import *

# Fresh start (safe: no real bookings yet)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Stops ───────────────────────────────────────────────────────────────────
stops_data = [
    ("Hyderabad",        "Hyderabad",        "Telangana"),
    ("Vijayawada",       "Vijayawada",       "Andhra Pradesh"),
    ("Eluru",            "Eluru",            "Andhra Pradesh"),
    ("Dwaraka Tirumala", "Dwaraka Tirumala", "Andhra Pradesh"),
    ("Bhimavaram",       "Bhimavaram",       "Andhra Pradesh"),
    ("Tadepalligudem",   "Tadepalligudem",   "Andhra Pradesh"),
    ("Tanuku",           "Tanuku",           "Andhra Pradesh"),
    ("Kovvur",           "Kovvur",           "Andhra Pradesh"),
    ("Rajahmundry",      "Rajahmundry",      "Andhra Pradesh"),
    ("Kakinada",         "Kakinada",         "Andhra Pradesh"),
    ("Guntur",           "Guntur",           "Andhra Pradesh"),
    ("Visakhapatnam",    "Visakhapatnam",    "Andhra Pradesh"),
    ("Tirupati",         "Tirupati",         "Andhra Pradesh"),
    ("Bangalore",        "Bangalore",        "Karnataka"),
    ("Chennai",          "Chennai",          "Tamil Nadu"),
    ("Mumbai",           "Mumbai",           "Maharashtra"),
    ("Pune",             "Pune",             "Maharashtra"),
    ("Delhi",            "New Delhi",        "Delhi"),
]
for name, city, state in stops_data:
    db.add(Stop(name=name, city=city, state=state))
db.commit()
stop_by = {s.city: s for s in db.query(Stop).all()}

# ── Buses ───────────────────────────────────────────────────────────────────
buses_data = [
    ("Sri Ganga Travels",    "AP37-AG-1201", "volvo",        40, ["wifi","ac","charging","blanket","water"],            4.6),
    ("ASBR Travels",         "AP37-AS-2202", "sleeper",      36, ["ac","blanket","charging","water"],                  4.5),
    ("LVP Travels",          "AP37-LV-3203", "luxury",       32, ["wifi","ac","blanket","charging","snacks","tv"],     4.7),
    ("Atluri Travels",       "AP37-AT-4204", "semi_sleeper", 40, ["ac","charging","water"],                            4.3),
    ("Sree KVR Travels",     "AP37-KV-5205", "sleeper",      36, ["ac","blanket","water","charging"],                  4.4),
    ("Kaveri Travels",       "AP37-KA-6206", "seater",       45, ["ac","water"],                                       4.1),
    ("SVKDT Travels",        "AP37-SV-7207", "semi_sleeper", 40, ["ac","charging","water"],                            4.2),
    ("Sri Krishna Travels",  "AP37-SK-8208", "volvo",        40, ["wifi","ac","charging","blanket","water"],            4.6),
    ("Orange Travels",       "AP37-OR-9209", "luxury",       32, ["wifi","ac","blanket","charging","snacks","tv"],     4.8),
    ("Pramukh Travels",      "AP37-PR-1010", "volvo",        44, ["wifi","ac","charging","blanket","water"],            4.7),
    ("Zingbus Plus / MAXX",  "AP37-ZB-1111", "luxury",       30, ["wifi","ac","blanket","charging","snacks","tv","pillow"], 4.9),
    ("IntrCity Travels",     "AP37-IC-1212", "sleeper",      36, ["wifi","ac","blanket","charging","water"],           4.6),
]
buses = []
for name, number, btype, seats, amen, rating in buses_data:
    b = Bus(name=name, number=number, bus_type=btype, total_seats=seats, amenities=amen, rating=rating)
    db.add(b); buses.append(b)
db.commit()
for b in buses:
    db.refresh(b)

# ── Routes (each pair created in BOTH directions) ────────────────────────────
route_pairs = [
    # West Godavari cluster ↔ hubs (your core region)
    ("Hyderabad", "Eluru",            330, 5.5),
    ("Hyderabad", "Dwaraka Tirumala", 360, 6.0),
    ("Hyderabad", "Bhimavaram",       380, 6.5),
    ("Hyderabad", "Tadepalligudem",   350, 6.0),
    ("Hyderabad", "Tanuku",           370, 6.2),
    ("Hyderabad", "Rajahmundry",      400, 7.0),
    ("Hyderabad", "Vijayawada",       275, 4.5),
    ("Hyderabad", "Visakhapatnam",    620, 10.0),
    ("Hyderabad", "Guntur",           285, 4.8),
    # Vijayawada ↔ West Godavari
    ("Vijayawada", "Eluru",            60, 1.5),
    ("Vijayawada", "Dwaraka Tirumala", 90, 2.0),
    ("Vijayawada", "Bhimavaram",      110, 2.5),
    ("Vijayawada", "Tadepalligudem",   80, 2.0),
    ("Vijayawada", "Rajahmundry",     150, 3.0),
    ("Vijayawada", "Visakhapatnam",   350, 5.5),
    # Inside the cluster
    ("Eluru", "Dwaraka Tirumala",      40, 1.0),
    ("Eluru", "Bhimavaram",            50, 1.3),
    ("Eluru", "Tadepalligudem",        35, 1.0),
    ("Eluru", "Tanuku",                55, 1.5),
    ("Eluru", "Rajahmundry",           90, 2.0),
    ("Dwaraka Tirumala", "Tadepalligudem", 25, 0.8),
    ("Dwaraka Tirumala", "Bhimavaram",     45, 1.2),
    ("Tadepalligudem", "Tanuku",       25, 0.7),
    ("Tanuku", "Kovvur",               30, 0.8),
    ("Kovvur", "Rajahmundry",          15, 0.5),
    ("Rajahmundry", "Kakinada",        65, 1.5),
    # Other popular long routes
    ("Hyderabad", "Bangalore",        570, 8.5),
    ("Hyderabad", "Chennai",          625, 9.0),
    ("Hyderabad", "Mumbai",           710, 12.0),
    ("Bangalore", "Vijayawada",       700, 11.0),
    ("Bangalore", "Tirupati",         250, 5.0),
    ("Bangalore", "Chennai",          350, 5.5),
    ("Mumbai", "Pune",                150, 3.0),
]
routes = []
for a, b, dist, dur in route_pairs:
    for o, d in ((a, b), (b, a)):
        r = Route(origin_id=stop_by[o].id, destination_id=stop_by[d].id, distance_km=dist, duration_hrs=dur)
        db.add(r); routes.append(r)
db.commit()
for r in routes:
    db.refresh(r)

# ── Schedules (3 departures per route, varied buses/times/prices) ────────────
DEP_TIMES = ["06:00", "09:30", "14:30", "21:00", "23:00"]
for i, r in enumerate(routes):
    for k in range(3):
        bus = buses[(i + k) % len(buses)]
        dh, dm = map(int, DEP_TIMES[(i + k) % len(DEP_TIMES)].split(":"))
        total = dh * 60 + dm + int(r.duration_hrs * 60)
        ah, am = (total // 60) % 24, total % 60
        price = max(199, int(r.distance_km * 1.6)) + k * 80
        db.add(Schedule(
            bus_id=bus.id, route_id=r.id,
            departure_time=dtime(dh, dm), arrival_time=dtime(ah, am),
            base_price=price,
        ))
db.commit()

print(f"Seed complete - {len(stops_data)} stops, {len(buses)} buses, {len(routes)} routes, {len(routes)*3} schedules.")
db.close()
