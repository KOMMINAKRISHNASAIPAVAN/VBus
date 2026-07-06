import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Bus, MapPin, Route as RouteIcon, CalendarClock, Ticket,
  Plus, Trash2, Users, IndianRupee,
} from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { key: 'buses',     label: 'Buses',     icon: Bus },
  { key: 'stops',     label: 'Stops',     icon: MapPin },
  { key: 'routes',    label: 'Routes',    icon: RouteIcon },
  { key: 'trips',     label: 'Trips',     icon: CalendarClock },
  { key: 'bookings',  label: 'Bookings',  icon: Ticket },
]

const BUS_TYPES = ['sleeper', 'semi_sleeper', 'seater', 'luxury', 'volvo']

// ── Layout helpers ────────────────────────────────────────────────────────────
const LAYOUT_TYPES = [
  { value: 'seater',       label: 'Seater only' },
  { value: 'sleeper',      label: 'Sleeper only (LB + UB)' },
  { value: 'semi_sleeper', label: 'Semi-Sleeper (Left: LB+UB | Right: Seater+UB)' },
]

const DEFAULT_LAYOUT = {
  kind: 'seater', rows: 10, left: 2, right: 2, ladies: 0,
  left_rows: 8,        // semi_sleeper: LB+UB rows on left side
  right_seater_rows: 5, // semi_sleeper: seater rows on right side
  right_ub_rows: 8,    // semi_sleeper: UB rows on right side
  fares: {}, blocked: [],
}

const totalOf = (l) => {
  const left = +l.left || 0, right = +l.right || 0
  if (l.kind === 'sleeper') return (+l.rows || 0) * (left + right) * 2
  if (l.kind === 'semi_sleeper') {
    const lr = +l.left_rows || 0
    const sr = +l.right_seater_rows || 0
    const ur = +l.right_ub_rows || 0
    return lr * left * 2 + sr * right + ur * right
  }
  return (+l.rows || 0) * (left + right)
}

// ── Admin layout preview (column-oriented, matches user SeatMap) ────────────
function PreviewSeat({ num, type, isBlocked, isLady }) {
  const color = isBlocked ? { box: 'border-slate-300 bg-slate-100', pill: 'bg-slate-200', text: 'text-slate-400' }
              : isLady    ? { box: 'border-pink-400 bg-pink-50',    pill: 'bg-pink-200',  text: 'text-pink-600' }
              : type === 'lb'     ? { box: 'border-green-500 bg-white', pill: 'bg-green-100', text: 'text-green-700' }
              : type === 'ub'     ? { box: 'border-amber-400 bg-white', pill: 'bg-amber-100', text: 'text-amber-700' }
              : { box: 'border-green-400 bg-white', pill: 'bg-green-100', text: 'text-slate-700' }

  if (type === 'lb' || type === 'ub') {
    return (
      <div className={`w-full h-8 rounded-lg border-2 ${color.box} flex items-center justify-between px-1.5`}>
        <div className={`w-1.5 h-5 rounded ${color.pill} flex-shrink-0`} />
        <span className={`text-[9px] font-bold ${color.text}`}>{num}</span>
        <span className={`text-[8px] ${color.text} opacity-70`}>{type.toUpperCase()}</span>
      </div>
    )
  }
  // seater
  return (
    <div className={`w-full h-9 rounded-t-lg border-2 ${color.box} relative flex flex-col justify-end`}>
      <div className="absolute -top-1 left-1 right-1 flex gap-0.5">
        <div className={`flex-1 h-1.5 rounded-full ${color.pill}`} />
        <div className={`flex-1 h-1.5 rounded-full ${color.pill}`} />
      </div>
      <div className={`w-full h-2 rounded-b ${color.pill} opacity-60`} />
      <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${color.text}`}>{num}</span>
    </div>
  )
}

function LayoutPreview({ lay }) {
  const left = +lay.left || 0, right = +lay.right || 0, rows = +lay.rows || 0
  const blocked  = new Set((lay.blocked || []).map(String))
  const ladiesCount = +lay.ladies || 0
  const total = totalOf(lay)
  const ladiesSet = new Set()
  for (let i = 1; i <= Math.min(ladiesCount, total); i++) ladiesSet.add(String(i))

  let n = 0
  const mkSeat = (type) => {
    n += 1
    return <PreviewSeat key={n} num={n} type={type} isBlocked={blocked.has(String(n))} isLady={ladiesSet.has(String(n))} />
  }

  const legend = (
    <div className="flex flex-wrap gap-3 text-[10px] mb-3">
      {lay.kind !== 'sleeper' && <span className="flex items-center gap-1"><span className="w-5 h-3 rounded border-2 border-green-400 bg-white inline-block" /> Seater</span>}
      {lay.kind !== 'seater'  && <span className="flex items-center gap-1"><span className="w-5 h-3 rounded border-2 border-green-500 bg-white inline-block" /> LB</span>}
      {lay.kind !== 'seater'  && <span className="flex items-center gap-1"><span className="w-5 h-3 rounded border-2 border-amber-400 bg-white inline-block" /> UB</span>}
      {ladiesCount > 0        && <span className="flex items-center gap-1"><span className="w-5 h-3 rounded border-2 border-pink-400 bg-pink-50 inline-block" /> Ladies</span>}
      <span className="flex items-center gap-1"><span className="w-5 h-3 rounded border-2 border-slate-300 bg-slate-100 inline-block" /> Blocked</span>
    </div>
  )

  // build column arrays for a given type and col count
  const buildCols = (type, colCount) => {
    const all = Array.from({ length: rows * colCount }, () => mkSeat(type))
    return Array.from({ length: colCount }, (_, c) =>
      all.filter((_, i) => i % colCount === c)
    )
  }

  const DeckBox = ({ title, children }) => (
    <div>
      <div className="text-[10px] font-bold text-slate-600 mb-1">{title}</div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
        <div className="flex gap-1.5 items-start">{children}</div>
      </div>
    </div>
  )

  const ColGroup = ({ cols }) => cols.map((col, ci) => (
    <div key={ci} className="flex flex-col gap-1 flex-1 min-w-[36px]">{col}</div>
  ))

  const AisleDivider = () => <div className="self-stretch w-px bg-slate-300 mx-0.5" />

  if (lay.kind === 'seater') {
    n = 0
    const cols = buildCols('seater', left + right)
    return (<div>{legend}<DeckBox title="Seats"><ColGroup cols={cols.slice(0, left)} /><AisleDivider /><ColGroup cols={cols.slice(left)} /></DeckBox></div>)
  }

  if (lay.kind === 'sleeper') {
    n = 0
    // LB seats first (rows * cols), then UB seats
    const lbCols = buildCols('lb', left + right)
    const ubCols = buildCols('ub', left + right)
    return (
      <div>{legend}
        <div className="flex gap-3 overflow-x-auto">
          <DeckBox title="Lower deck"><ColGroup cols={lbCols.slice(0, left)} /><AisleDivider /><ColGroup cols={lbCols.slice(left)} /></DeckBox>
          <DeckBox title="Upper deck"><ColGroup cols={ubCols.slice(0, left)} /><AisleDivider /><ColGroup cols={ubCols.slice(left)} /></DeckBox>
        </div>
      </div>
    )
  }

  if (lay.kind === 'semi_sleeper') {
    n = 0
    const lr = +lay.left_rows || 0
    const sr = +lay.right_seater_rows || 0
    const ur = +lay.right_ub_rows || 0
    const lbAll = [], seaterAll = [], ubLeftAll = [], ubRightAll = []
    for (let r = 0; r < lr; r++) {
      for (let c = 0; c < left; c++) lbAll.push(mkSeat('lb'))
    }
    for (let r = 0; r < lr; r++) {
      for (let c = 0; c < left; c++) ubLeftAll.push(mkSeat('ub'))
    }
    for (let r = 0; r < sr; r++) {
      for (let c = 0; c < right; c++) seaterAll.push(mkSeat('seater'))
    }
    for (let r = 0; r < ur; r++) {
      for (let c = 0; c < right; c++) ubRightAll.push(mkSeat('ub'))
    }
    const lbCols      = Array.from({ length: left },  (_, c) => lbAll.filter((_, i) => i % left === c))
    const ubLeftCols  = Array.from({ length: left },  (_, c) => ubLeftAll.filter((_, i) => i % left === c))
    const seaterCols  = Array.from({ length: right }, (_, c) => seaterAll.filter((_, i) => i % right === c))
    const ubRightCols = Array.from({ length: right }, (_, c) => ubRightAll.filter((_, i) => i % right === c))
    return (
      <div>{legend}
        <div className="flex gap-3 overflow-x-auto">
          <DeckBox title="Lower deck (Left=LB, Right=Seater)">
            <ColGroup cols={lbCols} /><AisleDivider /><ColGroup cols={seaterCols} />
          </DeckBox>
          <DeckBox title="Upper deck (Left=UB, Right=UB)">
            <ColGroup cols={ubLeftCols} /><AisleDivider /><ColGroup cols={ubRightCols} />
          </DeckBox>
        </div>
      </div>
    )
  }
  return null
}

function LayoutEditor({ lay, set }) {
  const L = 'text-xs font-medium text-slate-500 mb-1 block'
  const isSleeper = lay.kind === 'sleeper'
  const isMixed   = lay.kind === 'semi_sleeper'
  const isSeater  = lay.kind === 'seater'

  return (
    <div className="space-y-4">
      {/* Layout type dropdown */}
      <div>
        <label className={L}>Layout Type</label>
        <select value={lay.kind} onChange={e => set({ ...lay, kind: e.target.value })} className="input-field appearance-none">
          {LAYOUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Column config */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={L}>Left columns</label><input type="number" min="1" max="4" value={lay.left} onChange={e => set({ ...lay, left: +e.target.value })} className="input-field" /></div>
        <div><label className={L}>Right columns</label><input type="number" min="0" max="4" value={lay.right} onChange={e => set({ ...lay, right: +e.target.value })} className="input-field" /></div>
      </div>

      {/* Row config */}
      {(isSeater || isSleeper) && (
        <div>
          <label className={L}>{isSleeper ? 'Rows (each = LB + UB)' : 'Rows'}</label>
          <input type="number" min="1" value={lay.rows} onChange={e => set({ ...lay, rows: +e.target.value })} className="input-field" />
        </div>
      )}
      {isMixed && (
        <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50">
          <p className="text-xs font-semibold text-slate-600">Row counts (Left side vs Right side are independent)</p>
          <div>
            <label className={L}>Left rows — LB + UB berths</label>
            <input type="number" min="1" value={lay.left_rows ?? 8}
              onChange={e => set({ ...lay, left_rows: +e.target.value })} className="input-field" />
          </div>
          <div className="border-t border-slate-200 pt-3">
            <p className="text-[11px] text-slate-400 mb-2">Right side rows (Seater &amp; UB can differ)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>Right seater rows</label>
                <input type="number" min="0" value={lay.right_seater_rows ?? 5}
                  onChange={e => set({ ...lay, right_seater_rows: +e.target.value })} className="input-field" />
              </div>
              <div>
                <label className={L}>Right UB rows</label>
                <input type="number" min="0" value={lay.right_ub_rows ?? 8}
                  onChange={e => set({ ...lay, right_ub_rows: +e.target.value })} className="input-field" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ladies seats */}
      <div>
        <label className={L}>Ladies seats (first N seats reserved)</label>
        <input type="number" min="0" value={lay.ladies} onChange={e => set({ ...lay, ladies: +e.target.value })} className="input-field" />
      </div>

      {/* Fares */}
      <div className="border-t border-slate-100 pt-3">
        <label className={L}>Fares (₹) — leave blank to use trip base price</label>
        <div className="grid grid-cols-2 gap-3">
          {(isSeater || isMixed) && (
            <div>
              <label className={L}>Seater fare</label>
              <input type="number" min="0" placeholder="₹" className="input-field"
                value={lay.fares?.seater ?? ''}
                onChange={e => set({ ...lay, fares: { ...(lay.fares||{}), seater: e.target.value === '' ? '' : +e.target.value } })} />
            </div>
          )}
          {(isSleeper || isMixed) && (
            <>
              {isMixed && <div className="col-span-2 text-[10px] text-slate-400">Left side: LB + UB &nbsp;|&nbsp; Right side: Seater + UB</div>}
              <div>
                <label className={L}>LB fare (left side)</label>
                <input type="number" min="0" placeholder="₹" className="input-field"
                  value={lay.fares?.lower ?? ''}
                  onChange={e => set({ ...lay, fares: { ...(lay.fares||{}), lower: e.target.value === '' ? '' : +e.target.value } })} />
              </div>
              <div>
                <label className={L}>UB fare (both sides)</label>
                <input type="number" min="0" placeholder="₹" className="input-field"
                  value={lay.fares?.upper ?? ''}
                  onChange={e => set({ ...lay, fares: { ...(lay.fares||{}), upper: e.target.value === '' ? '' : +e.target.value } })} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blocked seats */}
      <div>
        <label className={L}>Blocked seats (comma separated seat numbers)</label>
        <input className="input-field" placeholder="e.g. 3, 7, 12"
          value={(lay.blocked || []).join(', ')}
          onChange={e => set({ ...lay, blocked: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
      </div>

      {/* Summary + Preview */}
      <div className="text-xs text-slate-500 flex gap-3 flex-wrap">
        <span>Total seats: <b className="text-slate-900">{totalOf(lay)}</b></span>
        {isSeater  && <span className="text-blue-600">Seater: {(+lay.rows||0)*((+lay.left||0)+(+lay.right||0))}</span>}
        {isSleeper && <span className="text-green-600">LB: {(+lay.rows||0)*((+lay.left||0)+(+lay.right||0))}</span>}
        {isSleeper && <span className="text-amber-600">UB: {(+lay.rows||0)*((+lay.left||0)+(+lay.right||0))}</span>}
        {isMixed   && <span className="text-green-600">LB: {(+lay.left_rows||0)*(+lay.left||0)}</span>}
        {isMixed   && <span className="text-amber-600">UB left: {(+lay.left_rows||0)*(+lay.left||0)}</span>}
        {isMixed   && <span className="text-blue-600">Seater: {(+lay.right_seater_rows||0)*(+lay.right||0)}</span>}
        {isMixed   && <span className="text-amber-500">UB right: {(+lay.right_ub_rows||0)*(+lay.right||0)}</span>}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-x-auto">
        <LayoutPreview lay={lay} />
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [buses, setBuses] = useState([])
  const [stops, setStops] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [bookings, setBookings] = useState([])

  // form state
  const [busF, setBusF] = useState({ name: '', number: '', bus_type: 'sleeper', amenities: '', rating: 4.5 })
  const [busLay, setBusLay] = useState({ ...DEFAULT_LAYOUT })
  const [editBus, setEditBus] = useState(null)     // bus being layout-edited
  const [editLay, setEditLay] = useState({ ...DEFAULT_LAYOUT })
  const [stopF, setStopF] = useState({ name: '', city: '', state: '' })
  const [routeF, setRouteF] = useState({ origin_id: '', destination_id: '', distance_km: '', duration_hrs: '', via: '' })
  const [selectedRoute, setSelectedRoute] = useState(null)   // route whose stops are being managed
  const [routeStops, setRouteStops] = useState([])            // stops for selectedRoute
  const [rsF, setRsF] = useState({ stop_id: '', sequence: '', arrival_time: '', departure_time: '', is_pickup: true, is_drop: true, fare_seater: '', fare_sleeper: '' })
  const [tripF, setTripF] = useState({ bus_id: '', route_id: '', departure_time: '', arrival_time: '', base_price: '' })

  const loadCore = async () => {
    try {
      const [s, b, st, r, sc] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/buses'), api.get('/admin/stops'),
        api.get('/admin/routes'), api.get('/admin/schedules'),
      ])
      setStats(s.data)
      setBuses(Array.isArray(b.data) ? b.data : [])
      setStops(Array.isArray(st.data) ? st.data : [])
      setRoutes(Array.isArray(r.data) ? r.data : [])
      setSchedules(Array.isArray(sc.data) ? sc.data : [])
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to load admin data')
    }
  }
  useEffect(() => { loadCore() }, [])
  useEffect(() => { if (tab === 'bookings') api.get('/admin/bookings').then(r => setBookings(Array.isArray(r.data) ? r.data : [])).catch(() => {}) }, [tab])

  const err = (e, fb) => toast.error(e.response?.data?.detail || fb)

  const addBus = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/buses', {
        ...busF,
        total_seats: totalOf(busLay), rating: +busF.rating,
        amenities: busF.amenities.split(',').map(a => a.trim()).filter(Boolean),
        layout: busLay,
      })
      toast.success('Bus added')
      setBusF({ name: '', number: '', bus_type: 'sleeper', amenities: '', rating: 4.5 })
      setBusLay({ ...DEFAULT_LAYOUT })
      loadCore()
    } catch (e) { err(e, 'Failed to add bus') }
  }
  const delBus = async (id) => { if (!confirm('Deactivate this bus?')) return; try { await api.delete(`/admin/buses/${id}`); toast.success('Bus deactivated'); loadCore() } catch (e) { err(e, 'Failed') } }
  const openLayout = (b) => { setEditBus(b); setEditLay({ ...DEFAULT_LAYOUT, ...(b.layout || {}) }) }
  const saveLayout = async () => {
    try { await api.patch(`/admin/buses/${editBus.id}/layout`, { layout: editLay }); toast.success('Layout updated'); setEditBus(null); loadCore() }
    catch (e) { err(e, 'Failed to save layout') }
  }

  const addStop = async (e) => {
    e.preventDefault()
    if (!stopF.name || !stopF.city || !stopF.state) return toast.error('Fill all fields')
    try { await api.post('/admin/stops', stopF); toast.success('Stop added'); setStopF({ name: '', city: '', state: '' }); loadCore() }
    catch (e) { err(e, 'Failed to add stop') }
  }

  const addRoute = async (e) => {
    e.preventDefault()
    if (!routeF.origin_id || !routeF.destination_id) return toast.error('Pick origin & destination')
    try {
      const via = routeF.via ? routeF.via.split(',').map(v => v.trim()).filter(Boolean) : []
      await api.post('/admin/routes', {
        origin_id: +routeF.origin_id, destination_id: +routeF.destination_id,
        distance_km: +routeF.distance_km, duration_hrs: +routeF.duration_hrs,
        via_stops: via,
      })
      toast.success('Route added')
      setRouteF({ origin_id: '', destination_id: '', distance_km: '', duration_hrs: '', via: '' })
      loadCore()
    } catch (e) { err(e, 'Failed to add route') }
  }

  const delRoute = async (id) => {
    if (!confirm('Delete this route?')) return
    try { await api.delete(`/admin/routes/${id}`); toast.success('Route deleted'); loadCore(); if (selectedRoute?.id === id) setSelectedRoute(null) }
    catch (e) { err(e, 'Failed to delete route') }
  }

  const openRouteStops = async (r) => {
    setSelectedRoute(r)
    try { const res = await api.get(`/admin/routes/${r.id}/stops`); setRouteStops(res.data) }
    catch { setRouteStops([]) }
  }

  const addRouteStop = async (e) => {
    e.preventDefault()
    if (!rsF.stop_id || !rsF.sequence) return toast.error('Pick stop and sequence')
    try {
      await api.post(`/admin/routes/${selectedRoute.id}/stops`, {
        stop_id: +rsF.stop_id, sequence: +rsF.sequence,
        arrival_time: rsF.arrival_time || null, departure_time: rsF.departure_time || null,
        is_pickup: rsF.is_pickup, is_drop: rsF.is_drop,
        fare_seater: rsF.fare_seater ? +rsF.fare_seater : null,
        fare_sleeper: rsF.fare_sleeper ? +rsF.fare_sleeper : null,
      })
      toast.success('Stop added to route')
      setRsF({ stop_id: '', sequence: '', arrival_time: '', departure_time: '', is_pickup: true, is_drop: true, fare_seater: '', fare_sleeper: '' })
      const res = await api.get(`/admin/routes/${selectedRoute.id}/stops`)
      setRouteStops(res.data)
    } catch (e) { err(e, 'Failed to add stop') }
  }

  const delRouteStop = async (rsId) => {
    try {
      await api.delete(`/admin/routes/${selectedRoute.id}/stops/${rsId}`)
      toast.success('Stop removed')
      setRouteStops(prev => prev.filter(s => s.id !== rsId))
    } catch (e) { err(e, 'Failed to remove stop') }
  }

  const addTrip = async (e) => {
    e.preventDefault()
    if (!tripF.bus_id || !tripF.route_id || !tripF.departure_time || !tripF.arrival_time || !tripF.base_price)
      return toast.error('Fill all fields')
    try {
      await api.post('/admin/schedules', {
        bus_id: +tripF.bus_id, route_id: +tripF.route_id,
        departure_time: tripF.departure_time, arrival_time: tripF.arrival_time, base_price: +tripF.base_price,
      })
      toast.success('Trip/service added'); setTripF({ bus_id: '', route_id: '', departure_time: '', arrival_time: '', base_price: '' }); loadCore()
    } catch (e) { err(e, 'Failed to add trip') }
  }

  const [editAmount, setEditAmount] = useState({}) // { [booking_id]: value }

  const reloadBookings = () => api.get('/admin/bookings').then(r => setBookings(r.data)).catch(() => {})

  const updateAmount = async (b) => {
    const val = parseFloat(editAmount[b.id])
    if (!val || val <= 0) return toast.error('Enter a valid amount')
    try {
      await api.patch(`/admin/bookings/${b.id}/amount`, { total_amount: val })
      toast.success('Amount updated')
      setEditAmount(prev => { const n = { ...prev }; delete n[b.id]; return n })
      reloadBookings()
    } catch (e) { err(e, 'Failed to update amount') }
  }
  const confirmBk = async (b) => {
    try {
      await api.post(`/admin/bookings/${b.id}/confirm`)
      toast.success('Booking confirmed')
      reloadBookings(); loadCore()
      // Send WhatsApp message to user's registered phone
      const seats = (b.passenger_info || []).map(p => p.seat_number).join(', ')
      const phone = (b.passenger_info || [])[0]?.phone
      if (phone) {
        const msg = encodeURIComponent(
          `✅ VBus Booking Confirmed!\nPNR: ${b.pnr}\nRoute: ${b.boarding_stop} → ${b.dropping_stop}\nSeats: ${seats}\nAmount: ₹${b.total_amount}\nThank you for choosing VBus! 🚌`
        )
        window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank')
      }
    } catch (e) { err(e, 'Failed to confirm') }
  }
  const rejectBk = async (b) => {
    if (!confirm('Reject this booking and release the seats?')) return
    try {
      await api.post(`/admin/bookings/${b.id}/reject`)
      toast.success('Booking rejected')
      reloadBookings(); loadCore()
      const phone = (b.passenger_info || [])[0]?.phone
      if (phone) {
        const msg = encodeURIComponent(
          `❌ VBus Booking Rejected\nPNR: ${b.pnr}\nRoute: ${b.boarding_stop} → ${b.dropping_stop}\nYour seats have been released. Please contact us for assistance.`
        )
        window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank')
      }
    } catch (e) { err(e, 'Failed to reject') }
  }
  const stBadge = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700', completed: 'bg-blue-100 text-blue-700',
  }

  const label = 'text-xs font-medium text-slate-500 mb-1 block'

  return (
    <div className="min-h-screen bg-hero-gradient pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-vbus-600 flex items-center justify-center text-white"><LayoutDashboard className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage buses, stops, routes, trips & bookings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-vbus-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-vbus-300'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Total Buses',       stats.buses,               Bus],
              ['Total Routes',      stats.routes,              RouteIcon],
              ['Total Stops',       stats.stops,               MapPin],
              ['Total Bookings',    stats.bookings,            Ticket],
              ['Pending Requests',  stats.pending_bookings,    CalendarClock],
              ['Confirmed',         stats.confirmed_bookings,  Users],
              ['Available Seats',   stats.available_seats,     Bus],
              ['Blocked Seats',     stats.blocked_seats,       MapPin],
              ['Revenue (confirmed)', `₹${Math.round(stats.revenue || 0)}`, IndianRupee],
            ].map(([l, v, Icon]) => (
              <div key={l} className="glass-card p-5">
                <div className="w-9 h-9 rounded-lg bg-vbus-100 flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-vbus-600" /></div>
                <div className="text-2xl font-bold text-slate-900">{v ?? 0}</div>
                <div className="text-sm text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Buses */}
        {tab === 'buses' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addBus} className="glass-card p-5 space-y-3 lg:col-span-1">
              <h3 className="font-semibold text-slate-900">Add Bus</h3>
              <div><label className={label}>Operator / Bus name</label><input className="input-field" value={busF.name} onChange={e => setBusF({ ...busF, name: e.target.value })} placeholder="e.g. Orange Travels" /></div>
              <div><label className={label}>Bus number</label><input className="input-field" value={busF.number} onChange={e => setBusF({ ...busF, number: e.target.value })} placeholder="AP37-XX-1234" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Type</label><select className="input-field appearance-none" value={busF.bus_type} onChange={e => setBusF({ ...busF, bus_type: e.target.value })}>{BUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className={label}>Rating</label><input type="number" step="0.1" min="1" max="5" className="input-field" value={busF.rating} onChange={e => setBusF({ ...busF, rating: e.target.value })} /></div>
              </div>
              <div><label className={label}>Amenities (comma separated)</label><input className="input-field" value={busF.amenities} onChange={e => setBusF({ ...busF, amenities: e.target.value })} placeholder="wifi, ac, charging, water" /></div>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2">Seat layout</p>
                <LayoutEditor lay={busLay} set={setBusLay} />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Bus</button>
            </form>
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Buses ({buses.length})</h3>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {buses.filter(b => b.is_active !== false).map(b => (
                  <div key={b.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5">
                    <div><div className="font-medium text-slate-900 text-sm">{b.name} <span className="text-slate-400">· {b.number}</span></div><div className="text-xs text-slate-500">{b.bus_type} · {b.total_seats} seats · ★{b.rating}</div></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openLayout(b)} className="text-xs font-medium px-2.5 py-1 rounded-lg border border-vbus-200 text-vbus-700 hover:bg-vbus-50">Layout</button>
                      <button onClick={() => delBus(b.id)} className="text-red-500 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stops */}
        {tab === 'stops' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addStop} className="glass-card p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">Add Stop / City</h3>
              <div><label className={label}>Stop name</label><input className="input-field" value={stopF.name} onChange={e => setStopF({ ...stopF, name: e.target.value })} placeholder="e.g. Eluru" /></div>
              <div><label className={label}>City</label><input className="input-field" value={stopF.city} onChange={e => setStopF({ ...stopF, city: e.target.value })} placeholder="Eluru" /></div>
              <div><label className={label}>State</label><input className="input-field" value={stopF.state} onChange={e => setStopF({ ...stopF, state: e.target.value })} placeholder="Andhra Pradesh" /></div>
              <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Stop</button>
            </form>
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Stops ({stops.length})</h3>
              <div className="grid sm:grid-cols-2 gap-2 max-h-[28rem] overflow-y-auto">
                {stops.map(s => (
                  <div key={s.id} className="border border-slate-100 rounded-xl px-4 py-2.5 text-sm"><span className="font-medium text-slate-900">{s.city}</span><span className="text-slate-400"> · {s.state}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Routes */}
        {tab === 'routes' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Add Route Form */}
              <form onSubmit={addRoute} className="glass-card p-5 space-y-3">
                <h3 className="font-semibold text-slate-900">Add Route</h3>
                <div>
                  <label className={label}>Source (From)</label>
                  <select className="input-field appearance-none" value={routeF.origin_id} onChange={e => setRouteF({ ...routeF, origin_id: e.target.value })}>
                    <option value="">Select source…</option>
                    {stops.map(s => <option key={s.id} value={s.id}>{s.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Destination (To)</label>
                  <select className="input-field appearance-none" value={routeF.destination_id} onChange={e => setRouteF({ ...routeF, destination_id: e.target.value })}>
                    <option value="">Select destination…</option>
                    {stops.map(s => <option key={s.id} value={s.id}>{s.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Via Stops (comma separated)</label>
                  <input className="input-field" placeholder="e.g. Eluru, Bhimavaram, Tanuku" value={routeF.via} onChange={e => setRouteF({ ...routeF, via: e.target.value })} />
                  <p className="text-[11px] text-slate-400 mt-1">Intermediate cities between source and destination.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={label}>Distance (km)</label><input type="number" className="input-field" value={routeF.distance_km} onChange={e => setRouteF({ ...routeF, distance_km: e.target.value })} /></div>
                  <div><label className={label}>Duration (hrs)</label><input type="number" step="0.5" className="input-field" value={routeF.duration_hrs} onChange={e => setRouteF({ ...routeF, duration_hrs: e.target.value })} /></div>
                </div>
                <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Route</button>
              </form>

              {/* Routes List */}
              <div className="lg:col-span-2 glass-card p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Routes ({routes.length})</h3>
                <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                  {routes.map(r => (
                    <div key={r.id} className="border border-slate-100 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900 text-sm flex items-center gap-1 flex-wrap">
                            <span className="text-green-600">●</span>
                            <span>{r.origin}</span>
                            {(r.via_stops || []).length > 0 && (
                              <span className="text-slate-400 text-xs">→ {(r.via_stops || []).join(' → ')}</span>
                            )}
                            <span className="text-red-500">●</span>
                            <span>{r.destination}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {r.distance_km}km · {r.duration_hrs}h · {(r.route_stops || []).length} pickup/drop points
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openRouteStops(r)} className="text-xs font-medium px-2.5 py-1 rounded-lg border border-vbus-200 text-vbus-700 hover:bg-vbus-50">Stops</button>
                          <button onClick={() => delRoute(r.id)} className="text-red-500 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {routes.length === 0 && <p className="text-slate-400 text-center py-8">No routes yet</p>}
                </div>
              </div>
            </div>

            {/* Route Stops Manager */}
            {selectedRoute && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Pickup & Drop Points</h3>
                    <p className="text-sm text-slate-500">{selectedRoute.origin} → {selectedRoute.destination}</p>
                  </div>
                  <button onClick={() => setSelectedRoute(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕ Close</button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Add stop form */}
                  <form onSubmit={addRouteStop} className="space-y-3 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-700">Add Stop to Route</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={label}>Stop</label>
                        <select className="input-field appearance-none" value={rsF.stop_id} onChange={e => setRsF({ ...rsF, stop_id: e.target.value })}>
                          <option value="">Select…</option>
                          {stops.map(s => <option key={s.id} value={s.id}>{s.city}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={label}>Sequence #</label>
                        <input type="number" min="0" className="input-field" placeholder="0=first" value={rsF.sequence} onChange={e => setRsF({ ...rsF, sequence: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={label}>Arrival time</label><input type="time" className="input-field" value={rsF.arrival_time} onChange={e => setRsF({ ...rsF, arrival_time: e.target.value })} /></div>
                      <div><label className={label}>Departure time</label><input type="time" className="input-field" value={rsF.departure_time} onChange={e => setRsF({ ...rsF, departure_time: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={label}>Seater fare (₹)</label><input type="number" className="input-field" placeholder="from origin" value={rsF.fare_seater} onChange={e => setRsF({ ...rsF, fare_seater: e.target.value })} /></div>
                      <div><label className={label}>Sleeper fare (₹)</label><input type="number" className="input-field" placeholder="from origin" value={rsF.fare_sleeper} onChange={e => setRsF({ ...rsF, fare_sleeper: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={rsF.is_pickup} onChange={e => setRsF({ ...rsF, is_pickup: e.target.checked })} className="rounded" />
                        <span className="text-green-700 font-medium">Pickup point</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={rsF.is_drop} onChange={e => setRsF({ ...rsF, is_drop: e.target.checked })} className="rounded" />
                        <span className="text-red-600 font-medium">Drop point</span>
                      </label>
                    </div>
                    <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Stop</button>
                  </form>

                  {/* Stops list */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Configured Stops ({routeStops.length})</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {routeStops.length === 0 && <p className="text-slate-400 text-sm text-center py-6">No stops configured yet</p>}
                      {routeStops.map((rs, i) => (
                        <div key={rs.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-vbus-100 text-vbus-700 text-xs font-bold flex items-center justify-center">{rs.sequence}</span>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{rs.stop_city}</div>
                              <div className="text-xs text-slate-500 flex gap-2">
                                {rs.arrival_time && <span>Arr: {rs.arrival_time}</span>}
                                {rs.departure_time && <span>Dep: {rs.departure_time}</span>}
                                {rs.fare_seater && <span>Seater ₹{rs.fare_seater}</span>}
                                {rs.fare_sleeper && <span>Sleeper ₹{rs.fare_sleeper}</span>}
                              </div>
                              <div className="flex gap-1 mt-0.5">
                                {rs.is_pickup && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Pickup</span>}
                                {rs.is_drop && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Drop</span>}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => delRouteStop(rs.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trips / Schedules */}
        {tab === 'trips' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addTrip} className="glass-card p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">Add Trip / Service</h3>
              <div><label className={label}>Bus</label><select className="input-field appearance-none" value={tripF.bus_id} onChange={e => setTripF({ ...tripF, bus_id: e.target.value })}><option value="">Select…</option>{buses.filter(b => b.is_active !== false).map(b => <option key={b.id} value={b.id}>{b.name} ({b.number})</option>)}</select></div>
              <div><label className={label}>Route</label><select className="input-field appearance-none" value={tripF.route_id} onChange={e => setTripF({ ...tripF, route_id: e.target.value })}><option value="">Select…</option>{routes.map(r => <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Departure</label><input type="time" className="input-field" value={tripF.departure_time} onChange={e => setTripF({ ...tripF, departure_time: e.target.value })} /></div>
                <div><label className={label}>Arrival</label><input type="time" className="input-field" value={tripF.arrival_time} onChange={e => setTripF({ ...tripF, arrival_time: e.target.value })} /></div>
              </div>
              <div><label className={label}>Base price (₹)</label><input type="number" className="input-field" value={tripF.base_price} onChange={e => setTripF({ ...tripF, base_price: e.target.value })} /></div>
              <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Trip</button>
            </form>
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Trips / Services ({schedules.length})</h3>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {schedules.map(s => (
                  <div key={s.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5 text-sm">
                    <div><div className="font-medium text-slate-900">{s.route}</div><div className="text-xs text-slate-500">{s.bus} · {s.departure_time}–{s.arrival_time} · ₹{s.base_price}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">All Bookings ({bookings.length})</h3>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-amber-600"><span>✏️</span> Fare editable (pending)</span>
                <span className="flex items-center gap-1 text-slate-500"><span>🔒</span> Fare locked (confirmed)</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">PNR</th>
                  <th className="py-2 pr-4">Bus</th>
                  <th className="py-2 pr-4">Route</th>
                  <th className="py-2 pr-4">Seats</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Booked</th>
                  <th className="py-2">Actions</th>
                </tr></thead>
                <tbody>
                  {bookings.map(b => {
                    const seats = (b.passenger_info || []).map(p => p.seat_number).join(', ')
                    const busName = b.bus_name || '—'
                    return (
                      <tr key={b.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-mono text-vbus-600">{b.pnr}</td>
                        <td className="py-2 pr-4 text-slate-700 font-medium">{busName}</td>
                        <td className="py-2 pr-4 text-slate-700">{b.boarding_stop} → {b.dropping_stop}</td>
                        <td className="py-2 pr-4">
                          <span className="bg-vbus-50 border border-vbus-200 text-vbus-700 text-xs px-2 py-0.5 rounded-lg font-mono">{seats || '—'}</span>
                        </td>
                        <td className="py-2 pr-4">
                          {b.status === 'confirmed' ? (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900">₹{b.total_amount}</span>
                              <span title="Fare locked after confirmation" className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 ml-1">🔒</span>
                            </div>
                          ) : b.status === 'cancelled' ? (
                            <span className="font-semibold text-slate-400 line-through">₹{b.total_amount}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-xs">₹</span>
                              <input
                                type="number" min="1"
                                value={editAmount[b.id] ?? b.total_amount}
                                onChange={e => setEditAmount(prev => ({ ...prev, [b.id]: e.target.value }))}
                                className="w-24 border border-amber-300 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 focus:border-vbus-400 focus:outline-none bg-amber-50"
                              />
                              {editAmount[b.id] !== undefined && String(editAmount[b.id]) !== String(b.total_amount) && (
                                <button onClick={() => updateAmount(b)} className="text-xs font-medium px-2 py-1 rounded-lg bg-vbus-600 text-white hover:bg-vbus-700">Save</button>
                              )}
                              <span title="Editable until confirmed" className="text-xs text-amber-500">✏️</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${stBadge[b.status] || 'bg-slate-100'}`}>{b.status}</span></td>
                        <td className="py-2 pr-4 text-slate-500">{new Date(b.booked_at).toLocaleDateString()}</td>
                        <td className="py-2">
                          {b.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => confirmBk(b)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">Confirm</button>
                              <button onClick={() => rejectBk(b)} className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50">Reject</button>
                            </div>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="text-slate-400 text-center py-8">No bookings yet</p>}
            </div>
          </div>
        )}
      </div>

      {editBus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4" onClick={() => setEditBus(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-lift max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-slate-900 mb-1">Edit seat layout</h3>
            <p className="text-sm text-slate-500 mb-4">{editBus.name} · {editBus.number}</p>
            <LayoutEditor lay={editLay} set={setEditLay} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditBus(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={saveLayout} className="btn-primary flex-1">Save layout</button>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Applies to newly-created trips (future dates). Existing trips keep their current seat map.</p>
          </div>
        </div>
      )}
    </div>
  )
}
