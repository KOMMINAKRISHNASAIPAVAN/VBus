import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, Bus, ShieldCheck, Check, AlertCircle, Phone } from 'lucide-react'
import { useBookingStore } from '../store'
import SeatMap from '../components/booking/SeatMap'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { vName, vAge, vPhone } from '../utils/validate'

const STEPS = ['Select Seats', 'Passenger Details', 'Review & Pay']

export default function BookingPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { selectedTrip, selectedSeats, step, setStep, setPassengers, passengers } = useBookingStore()
  const [seats, setSeats] = useState([])
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [form, setForm] = useState([])
  const [booking, setBooking] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  const [requested, setRequested] = useState(null)

  useEffect(() => {
    api.get(`/seats/${tripId}`)
      .then(({ data }) => setSeats(data))
      .catch(() => toast.error('Failed to load seats'))
      .finally(() => setLoadingSeats(false))
  }, [tripId])

  useEffect(() => {
    if (step === 2 && selectedSeats.length > 0) {
      setForm(selectedSeats.map((s) => ({
        name: '', age: '', phone: '', gender: s.status === 'ladies' ? 'female' : 'male', seat_number: s.seat_number
      })))
    }
  }, [step, selectedSeats])

  const isLadiesSeat = (sn) => selectedSeats.some(s => s.seat_number === sn && s.status === 'ladies')

  if (!selectedTrip) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No trip selected.</p>
          <button onClick={() => navigate('/search')} className="btn-primary">Back to Search</button>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    if (step === 1 && selectedSeats.length === 0) {
      return toast.error('Please select at least one seat')
    }
    if (step === 2) {
      for (const p of form) {
        const err = vName(p.name) || vAge(p.age) || vPhone(p.phone)
        if (err) return toast.error(`Seat ${p.seat_number}: ${err}`)
      }
      const badLadies = form.find(p => isLadiesSeat(p.seat_number) && p.gender !== 'female')
      if (badLadies) return setAlertMsg(`Seat ${badLadies.seat_number} is a ladies seat — only a female passenger can book it.`)

      // Adjacent-seat safety: a male cannot sit beside a female passenger
      const seatByNum = Object.fromEntries(seats.map(s => [s.seat_number, s]))
      const genderInBooking = Object.fromEntries(form.map(p => [p.seat_number, p.gender]))
      const partnerOf = (sn) => { const n = parseInt(sn, 10); return String(n % 2 === 1 ? n + 1 : n - 1) }
      const badAdj = form.find(p => {
        if (p.gender !== 'male') return false
        const pn = partnerOf(p.seat_number)
        const partnerGender = genderInBooking[pn] || (seatByNum[pn]?.status === 'booked' ? seatByNum[pn]?.gender_lock : null)
        return partnerGender === 'female'
      })
      if (badAdj) return setAlertMsg(`Seat ${badAdj.seat_number} is beside a female passenger — only a female can book it.`)

      setPassengers(form)
    }
    setStep(step + 1)
  }

  const handleBook = async () => {
    setBooking(true)
    try {
      const { data } = await api.post('/bookings/', {
        trip_id: parseInt(tripId),
        passengers: passengers.map(p => ({ ...p, age: parseInt(p.age) })),
        boarding_stop: selectedTrip.origin.city,
        dropping_stop: selectedTrip.destination.city,
      })
      toast.success('Booking request submitted')
      setRequested(data)
    } catch (e) {
      setAlertMsg(e.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const total = selectedSeats.reduce((s, seat) => s + seat.price, 0)

  return (
    <div className="min-h-screen bg-hero-gradient pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="bg-white border border-slate-200 p-2 rounded-xl hover:border-vbus-300 hover:shadow-sm transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {selectedTrip.origin.city} → {selectedTrip.destination.city}
            </h1>
            <p className="text-sm text-slate-500">{selectedTrip.bus.name} · {selectedTrip.travel_date}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i < step - 1 ? 'text-vbus-600' : i === step - 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${i < step - 1 ? 'bg-vbus-600' : i === step - 1 ? 'bg-vbus-500' : 'bg-slate-300'}`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px w-8 ${i < step - 1 ? 'bg-vbus-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Seat selection */}
        {step === 1 && (
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Bus className="w-5 h-5 text-vbus-600" /> Select Your Seats
              </h2>
              {loadingSeats ? (
                <div className="h-60 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-vbus-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <SeatMap seats={seats} layout={selectedTrip?.bus?.layout} />
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Passenger details */}
        {step === 2 && (
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
            {form.map((p, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-vbus-600" />
                  Passenger {i + 1} — Seat {p.seat_number}
                  {isLadiesSeat(p.seat_number) && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200">Ladies seat</span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name</label>
                    <input value={p.name}
                      onChange={e => { const f=[...form]; f[i]={...f[i],name:e.target.value}; setForm(f) }}
                      placeholder="Enter name" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" inputMode="numeric" maxLength={10} value={p.phone}
                        onChange={e => { const f=[...form]; f[i]={...f[i],phone:e.target.value.replace(/\D/g,'').slice(0,10)}; setForm(f) }}
                        placeholder="10-digit mobile" className="input-field pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Age</label>
                    <input type="number" value={p.age} min={1} max={120}
                      onChange={e => { const f=[...form]; f[i]={...f[i],age:e.target.value}; setForm(f) }}
                      placeholder="Age" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Gender</label>
                    <select value={p.gender}
                      onChange={e => { const f=[...form]; f[i]={...f[i],gender:e.target.value}; setForm(f) }}
                      disabled={isLadiesSeat(p.seat_number)}
                      className={`input-field appearance-none ${isLadiesSeat(p.seat_number) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 3 && (
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Journey Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['From', selectedTrip.origin.city],
                  ['To', selectedTrip.destination.city],
                  ['Date', String(selectedTrip.travel_date)],
                  ['Departure', selectedTrip.departure_time],
                  ['Bus', selectedTrip.bus.name],
                  ['Type', selectedTrip.bus.bus_type],
                ].map(([k,v]) => (
                  <div key={k}>
                    <div className="text-slate-500 text-xs mb-0.5">{k}</div>
                    <div className="text-slate-900 font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Passengers</h3>
              <div className="space-y-2">
                {passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{p.name} ({p.age}, {p.gender})</span>
                    <span className="text-vbus-600 font-medium">Seat {p.seat_number} — ₹{selectedSeats[i]?.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-vbus-600">₹{total}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vbus-600" /> Pay via UPI / QR
              </h3>
              <p className="text-xs text-slate-500 mb-4">Scan the QR or use the UPI ID below to pay <b className="text-vbus-700">₹{total}</b>. After payment, your booking request will be sent to admin for confirmation.</p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src="/payment-qr.jpg" alt="Payment QR" className="w-44 h-44 rounded-xl border border-slate-200 object-cover" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="text-xs text-slate-500 mb-1">UPI ID (PhonePe / GPay / Paytm)</div>
                    <div className="font-mono font-semibold text-slate-900 text-sm select-all">8520998910-3@ybl</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="text-xs text-slate-500 mb-1">Account Name</div>
                    <div className="font-semibold text-slate-900 text-sm">HDFC Bank - 1730</div>
                  </div>
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    After paying, click <b>Request Booking</b> below. Admin will verify and confirm your ticket.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="btn-outline flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleBook} disabled={booking} className="btn-primary flex items-center gap-2 min-w-40">
              {booking
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                : <><Check className="w-4 h-4" /> Request Booking</>}
            </button>
          )}
        </div>
      </div>

      {/* Centered alert modal */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAlertMsg('')}
          >
            <motion.div onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-lift max-w-sm w-full p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-1">Seat not allowed</h3>
              <p className="text-slate-600 text-sm mb-5 leading-relaxed">{alertMsg}</p>
              <button onClick={() => setAlertMsg('')} className="btn-primary w-full">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking-request received popup */}
      <AnimatePresence>
        {requested && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-lift max-w-md w-full p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Booking request received!</h3>
              <p className="text-slate-600 text-sm mb-2">Your seats are held under PNR <span className="font-mono font-semibold text-vbus-700">{requested.pnr}</span>.</p>
              <p className="text-slate-500 text-sm mb-5">Admin will verify your UPI payment and <b>confirm your ticket</b>. You will receive a <b>WhatsApp message</b> on your registered mobile once confirmed.</p>
              <button onClick={() => navigate(`/ticket/${requested.pnr}`)} className="btn-primary w-full">View my booking</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
