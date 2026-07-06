import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, Bus, ShieldCheck, Check, AlertCircle, Phone, QrCode, CreditCard, Landmark } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useBookingStore } from '../store'
import SeatMap from '../components/booking/SeatMap'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { vName, vAge, vPhone } from '../utils/validate'

const STEPS = ['Select Seats', 'Passenger Details', 'Review & Pay']

// ── Step 3: Payment page (RedBus-style) ─────────────────────────────────────
function Step3Pay({ total, selectedTrip, passengers, selectedSeats, booking, onBook, onBack }) {
  const [method, setMethod] = useState('upi')
  const gst = Math.round(total * 0.05)
  const grandTotal = total + gst

  const methods = [
    { id: 'upi',  icon: QrCode,     label: 'UPI', sub: 'Pay through QR code' },
    { id: 'card', icon: CreditCard, label: 'Credit / Debit card', sub: 'VISA, MasterCard and more' },
    { id: 'nb',   icon: Landmark,   label: 'Netbanking', sub: 'All major banks available' },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left — payment methods */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-slate-900">Pay ₹{grandTotal}</h2>
          <button onClick={onBack} className="text-sm text-vbus-600 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {methods.map(({ id, icon: Icon, label, sub }) => (
          <div key={id}
            onClick={() => setMethod(id)}
            className={`rounded-2xl border-2 cursor-pointer transition-all ${
              method === id ? 'border-vbus-500 bg-vbus-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${method === id ? 'text-vbus-600' : 'text-slate-500'}`} />
                <div>
                  <div className={`font-semibold text-sm ${method === id ? 'text-vbus-700' : 'text-slate-800'}`}>{label}</div>
                  <div className="text-xs text-slate-500">{sub}</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                method === id ? 'border-vbus-500' : 'border-slate-300'
              }`}>
                {method === id && <div className="w-2.5 h-2.5 rounded-full bg-vbus-500" />}
              </div>
            </div>

            {method === 'upi' && id === 'upi' && (
              <div className="px-5 pb-5 border-t border-vbus-100 flex flex-col items-center">
                <p className="text-xs text-slate-500 mt-3 mb-4 text-center">
                  Scan the QR to pay <b className="text-vbus-700">₹{grandTotal}</b>. After payment, click <b>Request Booking</b>.
                </p>
                {/* Dynamic UPI QR — encodes exact amount */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={`upi://pay?pa=8520998910-3@ybl&pn=VBus&am=${grandTotal}&cu=INR&tn=VBus+Ticket`}
                    size={192}
                    bgColor="#ffffff"
                    fgColor="#1e293b"
                    level="M"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Scan with any UPI app — amount pre-filled</p>
                {/* PhonePe deep-link button */}
                <a
                  href={`phonepe://pay?pa=8520998910-3@ybl&pn=VBus&am=${grandTotal}&cu=INR&tn=VBus+Ticket`}
                  className="mt-4 w-full flex items-center justify-center gap-2.5 bg-[#5f259f] hover:bg-[#4e1d85] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.547 4.516c-1.03-.23-2.09-.23-3.12 0L7.5 5.25 4.5 12l3 6.75 2.927.734c1.03.23 2.09.23 3.12 0L16.5 18.75l3-6.75-3-6.75-2.953-.734zM12 15.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z"/>
                  </svg>
                  Pay ₹{grandTotal} via PhonePe
                </a>
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed mt-3 w-full text-center">
                  After paying, click <b>Request Booking</b> below.
                </div>
              </div>
            )}

            {method === id && id !== 'upi' && (
              <div className="px-5 pb-4 border-t border-slate-100">
                <p className="text-sm text-slate-400 mt-3">This payment method is coming soon. Please use UPI / QR for now.</p>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={onBook}
          disabled={booking || method !== 'upi'}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 text-base disabled:opacity-60"
        >
          {booking
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            : <><ShieldCheck className="w-5 h-5" /> Request Booking</>}
        </button>
        {method !== 'upi' && (
          <p className="text-xs text-center text-slate-400">Select UPI to proceed</p>
        )}
      </div>

      {/* Right — order summary */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fare Summary</div>
            <div className="space-y-2 text-sm">
              {selectedSeats.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-600">Seat {s.seat_number} ({s.seat_type || 'seater'})</span>
                  <span className="font-medium">₹{s.price}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-500">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between">
              <span className="font-bold text-slate-900 text-base">Total</span>
              <span className="font-bold text-slate-900 text-xl">₹{grandTotal}</span>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-slate-100">
            <div className="font-semibold text-slate-900 text-sm mb-1">{selectedTrip.bus.name}</div>
            <div className="text-xs text-slate-500 mb-3 capitalize">{selectedTrip.bus.bus_type.replace('_', ' ')}</div>
            <div className="flex gap-3 items-stretch">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1 w-px bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{selectedTrip.departure_time}</div>
                  <div className="text-xs text-slate-500">{selectedTrip.origin.city}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{selectedTrip.arrival_time}</div>
                  <div className="text-xs text-slate-500">{selectedTrip.destination.city}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Passengers</div>
            <div className="space-y-2">
              {passengers.map((p, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{p.gender} · {p.age} yrs</div>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5">Seat {p.seat_number}</span>
                </div>
              ))}
            </div>
            {passengers[0]?.phone && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">Your ticket will be sent to</div>
                <div className="text-sm font-medium text-slate-900 mt-0.5">+91 {passengers[0].phone}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    const boarding = selectedTrip?.origin?.city || ''
    const dropping = selectedTrip?.destination?.city || ''
    api.get(`/seats/${tripId}`, { params: { boarding, dropping } })
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
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
            <Step3Pay
              total={total}
              selectedTrip={selectedTrip}
              passengers={passengers}
              selectedSeats={selectedSeats}
              booking={booking}
              onBook={handleBook}
              onBack={() => setStep(2)}
            />
          </motion.div>
        )}

        {/* Navigation — hidden on step 3 (Step3Pay has its own button) */}
        {step !== 3 && (
          <div className="mt-6 flex justify-between">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="btn-outline flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
