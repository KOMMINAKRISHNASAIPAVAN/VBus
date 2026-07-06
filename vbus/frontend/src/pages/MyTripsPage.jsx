import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Ticket, Bus, MapPin, Calendar, X, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_META = {
  pending:           { label: 'Request Sent',      cls: 'text-amber-700 bg-amber-50 border-amber-200',   desc: 'Admin is reviewing your request.' },
  payment_requested: { label: 'Pay Now',            cls: 'text-blue-700 bg-blue-50 border-blue-200',      desc: 'Admin has confirmed your booking. Please pay and click "I\'ve Paid".' },
  payment_done:      { label: 'Payment Submitted',  cls: 'text-purple-700 bg-purple-50 border-purple-200', desc: 'Admin is verifying your payment.' },
  confirmed:         { label: 'Confirmed',          cls: 'text-green-700 bg-green-50 border-green-200',   desc: null },
  cancelled:         { label: 'Cancelled',          cls: 'text-red-700 bg-red-50 border-red-200',         desc: null },
  completed:         { label: 'Completed',          cls: 'text-slate-700 bg-slate-50 border-slate-200',   desc: null },
}

export default function MyTripsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const [showQr, setShowQr] = useState(null) // booking id
  const navigate = useNavigate()

  const reload = () =>
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))

  useEffect(() => { reload() }, [])

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      const { data } = await api.post(`/bookings/${id}/cancel`)
      setBookings(b => b.map(x => x.id === id ? data : x))
      toast.success('Booking cancelled')
    } catch { toast.error('Cancellation failed') }
  }

  const markPaid = async (b) => {
    setPayingId(b.id)
    try {
      await api.post(`/bookings/${b.id}/mark_paid`)
      toast.success('Notified admin — awaiting confirmation')
      // WhatsApp to admin
      const phone = (b.passenger_info || [])[0]?.phone
      const seats = (b.passenger_info || []).map(p => p.seat_number).join(', ')
      const msg = encodeURIComponent(
        `\ud83d\udcb8 *Payment Done*\n\nPNR: *${b.pnr}*\nRoute: ${b.boarding_stop} \u2192 ${b.dropping_stop}\nSeats: ${seats}\nAmount: \u20b9${b.total_amount}\nPassenger: ${(b.passenger_info || [])[0]?.name} | +91${phone}\n\nPlease verify and confirm the ticket.`
      )
      window.open(`https://wa.me/918520998910?text=${msg}`, '_blank')
      reload()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally { setPayingId(null) }
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
            {bookings.map((booking, i) => {
              const meta = STATUS_META[booking.status] || STATUS_META.pending
              const isPaymentRequested = booking.status === 'payment_requested'
              const upiLink = `upi://pay?pa=8520998910-3@ybl&pn=VBus&am=${booking.total_amount}&cu=INR&tn=VBus+${booking.pnr}`

              return (
                <motion.div key={booking.id}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 transition-all ${isPaymentRequested ? 'border-blue-300 shadow-blue-100 shadow-md' : 'hover:border-vbus-300 hover:shadow-lift'}`}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-vbus-600 font-semibold text-sm">{booking.pnr}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.cls}`}>
                          {meta.label}
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

                  {/* Status description banner */}
                  {meta.desc && (
                    <div className={`text-xs rounded-xl px-3 py-2 border mb-3 ${meta.cls}`}>
                      {meta.desc}
                    </div>
                  )}

                  {/* Payment section for payment_requested */}
                  {isPaymentRequested && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 space-y-3">
                      <p className="text-sm font-semibold text-blue-800">Pay ₹{booking.total_amount} to complete booking</p>
                      {/* QR toggle */}
                      <button onClick={() => setShowQr(showQr === booking.id ? null : booking.id)}
                        className="flex items-center gap-2 text-xs text-blue-700 font-medium hover:underline">
                        <QrCode className="w-4 h-4" />
                        {showQr === booking.id ? 'Hide QR' : 'Show QR Code'}
                      </button>
                      {showQr === booking.id && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 bg-white rounded-xl border border-blue-200">
                            <QRCodeSVG value={upiLink} size={160} bgColor="#ffffff" fgColor="#1e293b" level="M" />
                          </div>
                          <p className="text-[11px] text-slate-500">Scan with any UPI app — amount pre-filled</p>
                        </div>
                      )}
                      {/* UPI app buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <a href={`phonepe://pay?pa=8520998910-3@ybl&pn=VBus&am=${booking.total_amount}&cu=INR&tn=VBus+${booking.pnr}`}
                          className="flex flex-col items-center gap-1 bg-[#5f259f] text-white text-xs font-semibold py-2.5 rounded-xl">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M13.547 4.516c-1.03-.23-2.09-.23-3.12 0L7.5 5.25 4.5 12l3 6.75 2.927.734c1.03.23 2.09.23 3.12 0L16.5 18.75l3-6.75-3-6.75-2.953-.734zM12 15.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z"/></svg>
                          PhonePe
                        </a>
                        <a href={`tez://upi/pay?pa=8520998910-3@ybl&pn=VBus&am=${booking.total_amount}&cu=INR&tn=VBus+${booking.pnr}`}
                          className="flex flex-col items-center gap-1 bg-[#1a73e8] text-white text-xs font-semibold py-2.5 rounded-xl">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                          GPay
                        </a>
                        <a href={`paytmmp://pay?pa=8520998910-3@ybl&pn=VBus&am=${booking.total_amount}&cu=INR&tn=VBus+${booking.pnr}`}
                          className="flex flex-col items-center gap-1 bg-[#00b9f5] text-white text-xs font-semibold py-2.5 rounded-xl">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                          Paytm
                        </a>
                      </div>
                      <button onClick={() => markPaid(booking)} disabled={payingId === booking.id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {payingId === booking.id
                          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Notifying...</>
                          : "✅ I've Paid — Notify Admin"}
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => booking.status === 'confirmed' && navigate(`/ticket/${booking.pnr}`)}
                      disabled={booking.status !== 'confirmed'}
                      className={`flex-1 text-sm py-2 rounded-xl border font-medium transition-colors ${
                        booking.status === 'confirmed'
                          ? 'btn-outline'
                          : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'View Ticket' : 'Ticket not ready yet'}
                    </button>
                    {booking.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(booking.id)}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
