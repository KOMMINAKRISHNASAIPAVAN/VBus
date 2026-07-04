import { motion } from 'framer-motion'
import { useBookingStore } from '../../store'
import { clsx } from 'clsx'

function SeatBtn({ seat, selected, onToggle, tall }) {
  const { status } = seat
  const selectable = status === 'available' || status === 'ladies'
  const cls = clsx(
    'relative border-2 transition-all duration-150 flex flex-col items-center justify-end pb-1 text-[10px] font-medium select-none',
    tall ? 'w-9 h-16 rounded-xl' : 'w-9 h-10 rounded-t-xl',
    selectable && selected && 'seat-selected shadow-lg shadow-vbus-500/40 scale-105',
    status === 'available' && !selected && 'seat-available',
    status === 'ladies'    && !selected && 'seat-ladies',
    (status === 'booked' || status === 'blocked' || status === 'locked') && 'seat-booked cursor-not-allowed opacity-70',
  )
  return (
    <motion.button
      whileHover={selectable ? { scale: 1.08 } : {}}
      whileTap={selectable ? { scale: 0.95 } : {}}
      onClick={() => selectable && onToggle(seat)}
      disabled={!selectable}
      className={cls}
      title={`Seat ${seat.seat_number} — ₹${seat.price}${status === 'ladies' ? ' (Ladies)' : status !== 'available' ? ` (${status})` : ''}`}
    >
      {!tall && (
        <div className="absolute -top-1.5 left-1.5 right-1.5 flex gap-1">
          <div className="flex-1 h-2 rounded-full bg-current opacity-30" />
          <div className="flex-1 h-2 rounded-full bg-current opacity-30" />
        </div>
      )}
      <span>{seat.seat_number}</span>
    </motion.button>
  )
}

function BusShell({ children }) {
  return (
    <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 pt-10">
      <div className="absolute top-3 left-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
        <span className="text-xs text-slate-400">Driver</span>
      </div>
      <div className="absolute top-3 right-4 w-5 h-8 border border-slate-300 rounded-sm flex items-center justify-center">
        <span className="text-[8px] text-slate-400 rotate-90">Door</span>
      </div>
      {children}
    </div>
  )
}

export default function SeatMap({ seats, layout }) {
  const { selectedSeats, toggleSeat } = useBookingStore()
  const sel = (s) => !!selectedSeats.find(x => x.seat_number === s.seat_number)

  const kind  = layout?.kind || 'seater'
  const left  = Math.max(1, +(layout?.left  ?? 2))
  const right = Math.max(0, +(layout?.right ?? 2))
  const rows  = +(layout?.rows ?? 10)

  // sort all seats numerically
  const sorted = [...seats].sort((a, b) => +a.seat_number - +b.seat_number)

  // ── SEATER ────────────────────────────────────────────────────────────────
  if (kind === 'seater') {
    const rowSize = left + right
    const rowsArr = []
    for (let i = 0; i < sorted.length; i += rowSize) rowsArr.push(sorted.slice(i, i + rowSize))
    return (
      <div className="space-y-6">
        <Legend kind={kind} />
        <BusShell>
          <div className="space-y-2">
            {rowsArr.map((row, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 text-right">{ri + 1}</span>
                <div className="flex gap-1.5">{row.slice(0, left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                {right > 0 && <div className="w-5 text-center text-xs text-slate-300">│</div>}
                <div className="flex gap-1.5">{row.slice(left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </div>
        </BusShell>
        <SelectedSummary />
      </div>
    )
  }

  // ── SLEEPER (left=LB+UB, right=LB+UB) ────────────────────────────────────
  if (kind === 'sleeper') {
    const cols = left + right
    // seats are numbered: row0-LB(cols), row0-UB(cols), row1-LB(cols), ...
    const rowsArr = []
    for (let r = 0; r < rows; r++) {
      const base = r * cols * 2
      rowsArr.push({
        lb: sorted.slice(base, base + cols),
        ub: sorted.slice(base + cols, base + cols * 2),
      })
    }
    return (
      <div className="space-y-6">
        <Legend kind={kind} />
        <BusShell>
          <div className="space-y-3">
            {rowsArr.map(({ lb, ub }, ri) => (
              <div key={ri} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-green-600 font-semibold w-4">LB</span>
                  <div className="flex gap-1.5">{lb.slice(0, left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                  {right > 0 && <div className="w-5 text-center text-xs text-slate-300">│</div>}
                  <div className="flex gap-1.5">{lb.slice(left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-amber-600 font-semibold w-4">UB</span>
                  <div className="flex gap-1.5">{ub.slice(0, left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                  {right > 0 && <div className="w-5 text-center text-xs text-slate-300">│</div>}
                  <div className="flex gap-1.5">{ub.slice(left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                </div>
              </div>
            ))}
          </div>
        </BusShell>
        <SelectedSummary />
      </div>
    )
  }

  // ── SEMI-SLEEPER (left=LB+UB, right=Seater+UB) ───────────────────────────
  if (kind === 'semi_sleeper') {
    // per row: left LB seats, right Seater seats, then (left+right) UB seats
    const perRow = left + right + (left + right) // LB+Seater+UB
    const rowsArr = []
    let idx = 0
    for (let r = 0; r < rows; r++) {
      const lb     = sorted.slice(idx, idx + left);           idx += left
      const seater = sorted.slice(idx, idx + right);          idx += right
      const ub     = sorted.slice(idx, idx + left + right);   idx += left + right
      rowsArr.push({ lb, seater, ub })
    }
    return (
      <div className="space-y-6">
        <Legend kind={kind} />
        <BusShell>
          <div className="flex gap-2 text-[9px] font-semibold mb-2 ml-6">
            <span className="text-green-600" style={{ minWidth: left * 44 }}>← Left (LB+UB)</span>
            <span className="text-blue-600">Right (Seat+UB) →</span>
          </div>
          <div className="space-y-3">
            {rowsArr.map(({ lb, seater, ub }, ri) => (
              <div key={ri} className="space-y-1">
                {/* LB row (left) + Seater row (right) */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-green-600 font-semibold w-6">LB</span>
                  <div className="flex gap-1.5">{lb.map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                  <div className="w-5 text-center text-xs text-slate-300">│</div>
                  <span className="text-[9px] text-blue-600 font-semibold w-6">Seat</span>
                  <div className="flex gap-1.5">{seater.map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                </div>
                {/* UB row (all cols) */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-amber-600 font-semibold w-6">UB</span>
                  <div className="flex gap-1.5">{ub.slice(0, left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                  <div className="w-5 text-center text-xs text-slate-300">│</div>
                  <span className="text-[9px] text-amber-600 font-semibold w-6">UB</span>
                  <div className="flex gap-1.5">{ub.slice(left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall />)}</div>
                </div>
              </div>
            ))}
          </div>
        </BusShell>
        <SelectedSummary />
      </div>
    )
  }

  // ── FALLBACK: generic lower/upper deck split ──────────────────────────────
  const lower = sorted.filter(s => s.deck === 'lower')
  const upper = sorted.filter(s => s.deck === 'upper')
  const cols  = left + right
  const buildRows = (list) => { const r = []; for (let i = 0; i < list.length; i += cols) r.push(list.slice(i, i + cols)); return r }
  const renderDeck = (list, label) => list.length === 0 ? null : (
    <div>
      {label && <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">{label} Deck</div>}
      <BusShell>
        <div className="space-y-2">
          {buildRows(list).map((row, ri) => (
            <div key={ri} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-4 text-right">{ri + 1}</span>
              <div className="flex gap-1.5">{row.slice(0, left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall={upper.length > 0} />)}</div>
              {right > 0 && <div className="w-5 text-center text-xs text-slate-300">│</div>}
              <div className="flex gap-1.5">{row.slice(left).map(s => <SeatBtn key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} tall={upper.length > 0} />)}</div>
            </div>
          ))}
        </div>
      </BusShell>
    </div>
  )
  return (
    <div className="space-y-6">
      <Legend kind="seater" />
      {upper.length > 0
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderDeck(lower, 'Lower')}{renderDeck(upper, 'Upper')}</div>
        : renderDeck(lower, '')}
      <SelectedSummary />
    </div>
  )
}

function Legend({ kind }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      {kind !== 'sleeper' && <div className="flex items-center gap-2"><div className="w-5 h-6 rounded-t-lg border-2 seat-available" /><span className="text-slate-500">Available</span></div>}
      {kind !== 'seater'  && <div className="flex items-center gap-2"><div className="w-5 h-8 rounded-xl border-2 border-green-400 bg-green-50" /><span className="text-slate-500">LB (Lower Berth)</span></div>}
      {kind !== 'seater'  && <div className="flex items-center gap-2"><div className="w-5 h-8 rounded-xl border-2 border-amber-400 bg-amber-50" /><span className="text-slate-500">UB (Upper Berth)</span></div>}
      <div className="flex items-center gap-2"><div className="w-5 h-6 rounded-t-lg border-2 seat-selected" /><span className="text-slate-500">Selected</span></div>
      <div className="flex items-center gap-2"><div className="w-5 h-6 rounded-t-lg border-2 seat-booked" /><span className="text-slate-500">Booked</span></div>
      <div className="flex items-center gap-2"><div className="w-5 h-6 rounded-t-lg border-2 seat-ladies" /><span className="text-slate-500">Ladies</span></div>
    </div>
  )
}

function SelectedSummary() {
  const { selectedSeats } = useBookingStore()
  if (!selectedSeats.length) return null
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-vbus-50 border border-vbus-200 rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-600 mb-1">Selected seats</div>
        <div className="flex gap-2 flex-wrap">
          {selectedSeats.map(s => (
            <span key={s.seat_number} className="bg-vbus-100 text-vbus-700 border border-vbus-200 px-2 py-0.5 rounded-lg text-xs font-medium">
              {s.seat_number} — ₹{s.price}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">Total</div>
        <div className="text-xl font-bold text-vbus-600">₹{selectedSeats.reduce((s, x) => s + x.price, 0)}</div>
      </div>
    </motion.div>
  )
}
