import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Share2, Home, Bus, User, Calendar, MapPin } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

function QRPlaceholder({ pnr }) {
  return (
    <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
      <div className="grid grid-cols-5 gap-0.5 w-full h-full">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i}
            style={{ background: Math.random() > 0.5 ? '#000' : '#fff' }}
            className="rounded-sm"
          />
        ))}
      </div>
    </div>
  )
}

export default function TicketPage() {
  const { pnr } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/bookings/${pnr}`)
      .then(({ data }) => setBooking(data))
      .catch(() => toast.error('Ticket not found'))
      .finally(() => setLoading(false))
  }, [pnr])

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-vbus-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen pt-16 flex items-center justify-center text-slate-500">
      Ticket not found.
    </div>
  )

  const passengers = booking.passenger_info || []

  return (
    <div className="min-h-screen bg-hero-gradient pt-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Success banner */}
        <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
          className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-500 mt-1">Your ticket is ready</p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
            {/* Brand top bar */}
            <div className="h-1.5 bg-gradient-to-r from-vbus-400 via-vbus-600 to-vbus-800" />

            <div className="p-6">
              {/* PNR */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">PNR Number</div>
                  <div className="text-2xl font-bold text-vbus-600 font-mono tracking-wider">{booking.pnr}</div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide
                  ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {booking.status}
                </div>
              </div>

              {/* Journey */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-slate-900">{booking.boarding_stop}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Boarding</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bus className="w-4 h-4 text-vbus-600" />
                  <div className="w-16 h-px bg-gradient-to-r from-vbus-500 to-slate-200" />
                  <span className="text-xs text-slate-400">VBus</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-slate-900">{booking.dropping_stop}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Dropping</div>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="relative my-4">
                <div className="border-t border-dashed border-slate-300" />
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border border-slate-200" />
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border border-slate-200" />
              </div>

              {/* Passengers */}
              <div className="space-y-2 mb-5">
                {passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <User className="w-3.5 h-3.5 text-vbus-600" />
                      {p.name} ({p.age}, {p.gender})
                    </div>
                    <span className="bg-vbus-50 border border-vbus-200 px-2 py-0.5 rounded-lg text-xs font-medium text-vbus-700">Seat {p.seat_number}</span>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-slate-500 text-sm">Total Amount</span>
                <span className="text-xl font-bold text-vbus-600">₹{booking.total_amount}</span>
              </div>

              {/* Dashed divider + QR */}
              <div className="relative my-4">
                <div className="border-t border-dashed border-slate-300" />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 leading-relaxed">
                  <p>Booked: {new Date(booking.booked_at).toLocaleDateString()}</p>
                  <p className="mt-0.5">Show this at boarding</p>
                </div>
                <QRPlaceholder pnr={booking.pnr} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
              <Download className="w-4 h-4" /> Download
            </button>
            <button className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
          <button onClick={() => navigate('/')} className="w-full mt-3 bg-white border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:text-vbus-600 hover:border-vbus-300 flex items-center justify-center gap-2 transition-all">
            <Home className="w-4 h-4" /> Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
