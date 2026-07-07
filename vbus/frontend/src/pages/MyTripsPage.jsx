import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Ticket, Bus, MapPin, Calendar, X, QrCode, CalendarClock, Zap, ChevronRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_META = {
  pending:           { label: 'Request Sent',      cls: 'text-amber-700 bg-amber-50 border-amber-200',   desc: 'Admin is reviewing your request.' },
  payment_requested: { label: 'Pay Now',            cls: 'text-blue-700 bg-blue-50 border-blue-200',      desc: 'Admin has confirmed your booking. Please pay and click "I\'ve Paid".' },
  payment_done:      { label: 'Payment Submitted',  cls: 'text-purple-700 bg-purple-50 border-purple-200', desc: 'Admin is verifying your payment.' },
  confirmed:         { label: 'Confirmed',          cls: 'text-green-700 bg-green-50 border-green-200',   desc: null },
  change_requested:  { label: 'Date Change Pending', cls: 'text-orange-700 bg-orange-50 border-orange-200', desc: 'Your date change request is being reviewed by admin.' },
  cancelled:         { label: 'Cancelled',          cls: 'text-red-700 bg-red-50 border-red-200',         desc: null },
  completed:         { label: 'Completed',          cls: 'text-slate-700 bg-slate-50 border-slate-200',   desc: 'This trip has been completed.' },
}

const REFUND_TIMELINE = [
  { method: 'UPI', time: '2–5 minutes', color: 'bg-green-100 text-green-700 border-green-200' },
  { method: 'Debit / Credit Card', time: '30 minutes', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { method: 'Net Banking', time: '2 hours', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { method: 'Wallet', time: 'Instant', color: 'bg-purple-100 text-purple-700 border-purple-200' },
]

export default function MyTripsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const [showQr, setShowQr] = useState(null)
  const [changeDateId, setChangeDateId] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [changingId, setChangingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null) // shows refund modal
  const navigate = useNavigate()

  const reload = () =>
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))

  useEffect(() => { reload() }, [])

  const cancelBooking = async (id) => {
    try {
      const { data } = await api.post(`/bookings/${id}/cancel`)
      setBookings(b => b.map(x => x.id === id ? data : x))
      toast.success('Booking cancelled — refund initiated')
      setCancellingId(null)
      // Notify admin via WhatsApp
      const bk = bookings.find(b => b.id === id)
      const seats = (bk?.passenger_info || []).map(p => p.seat_number).join(', ')
      const phone = (bk?.passenger_info || [])[0]?.phone
      const msg = encodeURIComponent(
        `❌ *Booking Cancelled by User*\n\nPNR: *${bk?.pnr}*\nRoute: ${bk?.boarding_stop} → ${bk?.dropping_stop}\nSeats: ${seats}\nAmount: ₹${bk?.total_amount}\nPassenger: ${(bk?.passenger_info || [])[0]?.name} | +91${phone}\n\nPlease process the refund.`
      )
      window.open(`https://wa.me/918520998910?text=${msg}`, '_blank')
    } catch { toast.error('Cancellation failed') }
  }

  const changeDate = async (booking) => {
    if (!newDate) return toast.error('Please select a new date')
    setChangingId(booking.id)
    try {
      const { data } = await api.patch(`/bookings/${booking.id}/change_date`, { new_date: newDate })
      setBookings(b => b.map(x => x.id === booking.id ? data : x))
      toast.success('Date change request submitted!')
      // Notify admin via WhatsApp
      const seats = (booking.passenger_info || []).map(p => p.seat_number).join(', ')
      const phone = (booking.passenger_info || [])[0]?.phone
      const msg = encodeURIComponent(
        `📅 *Date Change Request*\n\nPNR: *${booking.pnr}*\nRoute: ${booking.boarding_stop} → ${booking.dropping_stop}\nSeats: ${seats}\nNew Date: *${newDate}*\nPassenger: ${(booking.passenger_info || [])[0]?.name} | +91${phone}\n\nPlease approve or reject in Admin → Bookings.`
      )
      window.open(`https://wa.me/918520998910?text=${msg}`, '_blank')
    } catch {
      toast.error('Date change request failed')
    } finally {
      setChangingId(null)
      setChangeDateId(null)
      setNewDate('')
    }
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

        {/* Refund Modal */}
        <AnimatePresence>
          {cancellingId && (() => {
            const bk = bookings.find(b => b.id === cancellingId)
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4"
                onClick={() => setCancellingId(null)}>
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Lightning Refund</h3>
                      <p className="text-xs text-slate-500">Cancel & get instant refund</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-slate-600 mb-1">Booking: <span className="font-mono font-semibold text-vbus-600">{bk?.pnr}</span></p>
                    <p className="text-sm text-slate-600">Refund amount: <span className="font-bold text-green-600">₹{bk?.total_amount}</span></p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Refund Timeline</p>
                  <div className="space-y-2 mb-5">
                    {REFUND_TIMELINE.map(r => (
                      <div key={r.method} className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border ${r.color}`}>
                        <span className="font-medium">{r.method}</span>
                        <span className="font-bold">{r.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCancellingId(null)} className="btn-outline flex-1 text-sm">Keep Booking</button>
                    <button onClick={() => cancelBooking(cancellingId)}
                      className="flex-1 text-sm py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                      Confirm Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Change Date Modal */}
        <AnimatePresence>
          {changeDateId && (() => {
            const bk = bookings.find(b => b.id === changeDateId)
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4"
                onClick={() => setChangeDateId(null)}>
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CalendarClock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Free Date Change</h3>
                      <p className="text-xs text-slate-500">No extra charges</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-slate-600">Route: <span className="font-semibold text-slate-900">{bk?.boarding_stop} → {bk?.dropping_stop}</span></p>
                    <p className="text-sm text-slate-500 mt-0.5">PNR: <span className="font-mono text-vbus-600">{bk?.pnr}</span></p>
                  </div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Select new travel date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field mb-4" />
                  <p className="text-xs text-slate-400 mb-4">⚠️ Only one free date change per booking. Must be at least 2 hours before departure.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setChangeDateId(null)} className="btn-outline flex-1 text-sm">Cancel</button>
                    <button onClick={() => changeDate(bk)} disabled={changingId === changeDateId}
                      className="flex-1 text-sm py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {changingId === changeDateId
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><CalendarClock className="w-4 h-4" /> Confirm Change</>}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

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
              const today = new Date(); today.setHours(0,0,0,0)
              const travelDate = booking.travel_date ? new Date(booking.travel_date) : null
              const isPast = travelDate && travelDate < today
              // Treat confirmed past trips as completed visually
              const effectiveStatus = (booking.status === 'confirmed' && isPast) ? 'completed' : booking.status
              const meta = STATUS_META[effectiveStatus] || STATUS_META.pending
              const isPaymentRequested = booking.status === 'payment_requested'
              const upiLink = `upi://pay?pa=8520998910-3@ybl&pn=VBus&am=${booking.total_amount}&cu=INR&tn=VBus+${booking.pnr}`
              // Only allow change/cancel if trip is in the future
              const canModify = booking.status === 'confirmed' && !isPast

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
                      Booked: {new Date(booking.booked_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                    {booking.travel_date && (
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Bus className="w-3.5 h-3.5" />
                        Travel: {new Date(booking.travel_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    )}
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
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => effectiveStatus === 'confirmed' && navigate(`/ticket/${booking.pnr}`)}
                      disabled={booking.status !== 'confirmed'}
                      className={`flex-1 text-sm py-2 rounded-xl border font-medium transition-colors ${
                        booking.status === 'confirmed'
                          ? 'btn-outline'
                          : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'View Ticket' : effectiveStatus === 'completed' ? 'Trip Completed' : 'Ticket not ready yet'}
                    </button>
                    {canModify && (
                      <>
                        <button onClick={() => { setChangeDateId(booking.id); setNewDate('') }}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                          <CalendarClock className="w-4 h-4" /> Change Date
                        </button>
                        <button onClick={() => setCancellingId(booking.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
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
