import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Ticket, Bus, MapPin, Calendar, X } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  confirmed: 'text-green-700 bg-green-50 border-green-200',
  cancelled:  'text-red-700 bg-red-50 border-red-200',
  completed:  'text-blue-700 bg-blue-50 border-blue-200',
  pending:    'text-amber-700 bg-amber-50 border-amber-200',
}

export default function MyTripsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))
  }, [])

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      const { data } = await api.post(`/bookings/${id}/cancel`)
      setBookings(b => b.map(x => x.id === id ? data : x))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Cancellation failed')
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-vbus-100 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-vbus-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
            <p className="text-slate-500 text-sm">All your VBus bookings</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="glass-card h-32 shimmer" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Bus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips yet</h3>
            <p className="text-slate-500 mb-6">Your booked tickets will appear here</p>
            <button onClick={() => navigate('/')} className="btn-primary">Book a Bus</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => (
              <motion.div key={booking.id}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-vbus-300 hover:shadow-lift transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-vbus-600 font-semibold text-sm">{booking.pnr}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <MapPin className="w-4 h-4 text-vbus-600" />
                      {booking.boarding_stop} → {booking.dropping_stop}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-vbus-600">₹{booking.total_amount}</div>
                    <div className="text-xs text-slate-400">{booking.passenger_info?.length} passenger(s)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(booking.booked_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/ticket/${booking.pnr}`)}
                    className="flex-1 btn-outline text-sm py-2">View Ticket</button>
                  {booking.status === 'confirmed' && (
                    <button onClick={() => cancelBooking(booking.id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
