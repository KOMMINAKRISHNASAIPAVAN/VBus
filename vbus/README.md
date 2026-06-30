# 🚌 VBus — Premium Private Bus Booking Platform

A full-stack bus ticket booking system inspired by ZingBus, FlixBus, RedBus, and AbhiBus — built for **VBus Private Travels**.

---

## ✨ Features

### User Experience
- **3D Animated Bus** on the homepage using Three.js / React Three Fiber
- **Real-time seat map** with interactive seat selection (lower/upper deck, seater/sleeper)
- **Multi-step booking flow**: Search → Seat Selection → Passenger Details → Confirm
- **E-ticket with PNR** — printable, shareable booking confirmation
- **Trip history** with cancellation support
- **Auth system** — JWT-based login/register with persistent session

### Technical
- **FastAPI** backend with async SQLAlchemy 2.0
- **MySQL** database with full relational schema
- **React 18 + Vite** frontend with Tailwind CSS
- **Framer Motion** animations throughout
- **Zustand** state management
- **Docker Compose** for one-command setup
- Auto-seeding with 10 cities, 8 buses, 16 routes, 16 schedules

---

## 🗂 Project Structure

```
vbus/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, search, bookings, seats…)
│   │   ├── core/         # DB, config, JWT security
│   │   ├── models/       # SQLAlchemy ORM models
│   │   └── main.py       # FastAPI app entry
│   ├── seed.py           # Database seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/       # BusScene3D (Three.js)
│   │   │   ├── booking/  # SearchForm, BusCard, SeatMap
│   │   │   └── layout/   # Navbar, Footer
│   │   ├── pages/        # All page components
│   │   ├── store/        # Zustand (auth, search, booking)
│   │   └── utils/        # Axios instance
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
# Clone / unzip the project
cd vbus

# Start everything (MySQL + Backend + Frontend)
docker compose up --build

# In a separate terminal, seed the database
docker exec vbus-backend python seed.py
```

Open **http://localhost:5173**

---

### Option B — Local Development

#### Prerequisites
- Python 3.11+
- Node.js 20+
- MySQL 8.0 running locally

#### 1. MySQL Setup
```sql
CREATE DATABASE vbus;
CREATE USER 'vbus_user'@'localhost' IDENTIFIED BY 'vbus_pass';
GRANT ALL PRIVILEGES ON vbus.* TO 'vbus_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Backend
```bash
cd backend

# Copy and edit env
cp .env.example .env
# Edit DATABASE_URL in .env to match your MySQL credentials

# Install dependencies
pip install -r requirements.txt

# Run migrations (auto on startup) + seed
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs at **http://localhost:8000/api/docs**

#### 3. Frontend
```bash
cd frontend

npm install
npm run dev
```

Open **http://localhost:5173**

---

## 📊 Database Schema

```
users         → id, name, email, phone, password_hash, gender
stops         → id, name, city, state, lat, lng
buses         → id, name, number, bus_type, total_seats, amenities, rating
routes        → id, origin_id, destination_id, distance_km, duration_hrs
schedules     → id, bus_id, route_id, departure_time, arrival_time, base_price
trips         → id, schedule_id, travel_date, status
trip_seats    → id, trip_id, seat_number, deck, seat_type, status, price
bookings      → id, pnr, user_id, trip_id, status, total_amount, passenger_info
```

---

## 🛣 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET  | `/api/search/?origin=&destination=&travel_date=` | Search buses |
| GET  | `/api/search/cities` | List all cities |
| GET  | `/api/seats/{trip_id}` | Get seat map for a trip |
| POST | `/api/bookings/` | Create booking (auth required) |
| GET  | `/api/bookings/my` | Get my bookings (auth required) |
| GET  | `/api/bookings/{pnr}` | Get booking by PNR |
| POST | `/api/bookings/{id}/cancel` | Cancel booking (auth required) |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Animations | Framer Motion |
| State | Zustand |
| HTTP | Axios |
| Backend | FastAPI, SQLAlchemy 2.0 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | MySQL 8.0 |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx (production) |

---

## 🌆 Pre-seeded Data

**Cities:** Hyderabad, Bangalore, Chennai, Mumbai, New Delhi, Pune, Vijayawada, Visakhapatnam, Kolkata, Ahmedabad

**Bus Types:** Volvo, Luxury, Sleeper, Semi-Sleeper, Seater

**Sample Routes:** Hyderabad↔Bangalore, Mumbai↔Pune, Bangalore↔Chennai, and 13 more

---

## 🔒 Environment Variables

```env
# backend/.env
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/vbus
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 📱 Pages

| Route | Page |
|-------|------|
| `/` | Home with 3D bus scene & search |
| `/search` | Bus search results |
| `/booking/:tripId` | Seat selection + passenger form |
| `/ticket/:pnr` | E-ticket / booking confirmation |
| `/my-trips` | User's booking history |
| `/profile` | User profile management |
| `/login` | Login |
| `/register` | Registration |

---

## 🧩 Extending the Project

- **Payments:** Integrate Razorpay (`razorpay` Python SDK) in `POST /api/bookings/`
- **Notifications:** Add Twilio/SendGrid in the booking confirmation flow  
- **Kafka:** Add event streaming for seat locking TTL and booking events
- **Admin panel:** Add an `/admin` route with operator dashboard
- **Tracking:** Integrate Google Maps for live bus tracking

---

Built with ❤️ for VBus Private Travels
