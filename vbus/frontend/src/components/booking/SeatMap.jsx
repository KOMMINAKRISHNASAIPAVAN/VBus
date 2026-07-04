import { motion } from 'framer-motion'
import { useBookingStore } from '../../store'

// ── Single seat visual ────────────────────────────────────────────────────────
function Seat({ seat, selected, onToggle }) {
  const { status, seat_type, price } = seat
  const isSlp   = seat_type === 'lower' || seat_type === 'upper'
  const isSold  = status === 'booked' || status === 'blocked' || status === 'locked'
  const isLady  = status === 'ladies'
  const canPick = status === 'available' || isLady

  // colours
  const border = selected  ? 'border-green-500 bg-green-50'
               : isSold    ? 'border-slate-200 bg-slate-100'
               : isLady    ? 'border-pink-400 bg-pink-50'
               : 'border-green-400 bg-white hover:bg-green-50'

  const textCol = selected ? 'text-green-700'
                : isSold   ? 'text-slate-400'
                : isLady   ? 'text-pink-500'
                : 'text-slate-600'

  return (
    <motion.button
      whileHover={canPick ? { scale: 1.06 } : {}}
      whileTap={canPick   ? { scale: 0.94 } : {}}
      onClick={() => canPick && onToggle(seat)}
      disabled={!canPick}
      title={`Seat ${seat.seat_number} ₹${price}${isSold ? ' (Sold)' : isLady ? ' (Ladies)' : ''}`}
      className={`flex flex-col items-center gap-0.5 ${canPick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* seat body */}
      {isSlp ? (
        /* sleeper — tall rounded rectangle */
        <div className={`w-10 h-16 rounded-xl border-2 ${border} flex flex-col items-center justify-end pb-1.5 relative`}>
          {/* pillow line */}
          <div className={`absolute top-2 left-2 right-2 h-1.5 rounded-full ${selected ? 'bg-green-300' : isSold ? 'bg-slate-200' : isLady ? 'bg-pink-200' : 'bg-green-100'}`} />
          {isSold && <span className={`text-[9px] font-semibold ${textCol}`}>Sold</span>}
          {selected && <span className="text-[9px] font-semibold text-green-700">✓</span>}
        </div>
      ) : (
        /* seater — chair shape */
        <div className={`w-10 h-11 rounded-t-xl border-2 ${border} flex flex-col items-end justify-end relative`}>
          {/* headrest bumps */}
          <div className="absolute -top-1.5 left-1.5 right-1.5 flex gap-1">
            <div className={`flex-1 h-2 rounded-full ${selected ? 'bg-green-400' : isSold ? 'bg-slate-200' : isLady ? 'bg-pink-200' : 'bg-green-100'}`} />
            <div className={`flex-1 h-2 rounded-full ${selected ? 'bg-green-400' : isSold ? 'bg-slate-200' : isLady ? 'bg-pink-200' : 'bg-green-100'}`} />
          </div>
          {/* seat base */}
          <div className={`w-full h-2.5 rounded-b-lg ${selected ? 'bg-green-200' : isSold ? 'bg-slate-200' : isLady ? 'bg-pink-100' : 'bg-green-50'}`} />
          {isSold && <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-semibold ${textCol}`}>Sold</span>}
          {selected && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-green-700">✓</span>}
        </div>
      )}
      {/* price label */}
      <span className={`text-[10px] font-medium ${textCol}`}>
        {isSold ? 'Sold' : `₹${price}`}
      </span>
      {!isSold && isSlp && (
        <span className={`text-[9px] ${seat_type === 'lower' ? 'text-green-500' : 'text-amber-500'}`}>
          {seat_type === 'lower' ? 'LB' : 'UB'}
        </span>
      )}
    </motion.button>
  )
}

// ── Deck wrapper ──────────────────────────────────────────────────────────────
function Deck({ title, children }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-700">{title}</span>
        {title === 'Lower deck' && (
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
          </div>
        )}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}

// ── Main SeatMap ──────────────────────────────────────────────────────────────
export default function SeatMap({ seats, layout }) {
  const { selectedSeats, toggleSeat } = useBookingStore()
  const sel = (s) => !!selectedSeats.find(x => x.seat_number === s.seat_number)

  const kind  = layout?.kind  || 'seater'
  const left  = Math.max(1, +(layout?.left  ?? 1))
  const right = Math.max(0, +(layout?.right ?? 2))
  const rows  = +(layout?.rows ?? 10)

  const sorted = [...seats].sort((a, b) => +a.seat_number - +b.seat_number)

  // ── SEATER ────────────────────────────────────────────────────────────────
  if (kind === 'seater') {
    const cols = left + right
    const rowsArr = []
    for (let i = 0; i < sorted.length; i += cols) rowsArr.push(sorted.slice(i, i + cols))
    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <Deck title="Seater">
          {rowsArr.map((row, ri) => (
            <div key={ri} className="flex items-end gap-1.5">
              <div className="flex gap-1.5">{row.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              {right > 0 && <div className="w-4 self-stretch flex items-center justify-center"><span className="text-slate-200 text-xs">│</span></div>}
              <div className="flex gap-1.5">{row.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
            </div>
          ))}
        </Deck>
        <SelectedSummary />
      </div>
    )
  }

  // ── SLEEPER ───────────────────────────────────────────────────────────────
  // Lower deck: all LB seats | Upper deck: all UB seats
  if (kind === 'sleeper') {
    const cols = left + right
    const lbSeats = sorted.filter(s => s.seat_type === 'lower' || s.deck === 'lower')
    const ubSeats = sorted.filter(s => s.seat_type === 'upper' || s.deck === 'upper')
    const lbRows = [], ubRows = []
    for (let i = 0; i < lbSeats.length; i += cols) lbRows.push(lbSeats.slice(i, i + cols))
    for (let i = 0; i < ubSeats.length; i += cols) ubRows.push(ubSeats.slice(i, i + cols))

    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <div className="flex gap-4 overflow-x-auto">
          <Deck title="Lower deck">
            {lbRows.map((row, ri) => (
              <div key={ri} className="flex items-end gap-1.5">
                <div className="flex gap-1.5">{row.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                {right > 0 && <div className="w-4 self-stretch flex items-center justify-center"><span className="text-slate-200 text-xs">│</span></div>}
                <div className="flex gap-1.5">{row.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </Deck>
          <Deck title="Upper deck">
            {ubRows.map((row, ri) => (
              <div key={ri} className="flex items-end gap-1.5">
                <div className="flex gap-1.5">{row.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                {right > 0 && <div className="w-4 self-stretch flex items-center justify-center"><span className="text-slate-200 text-xs">│</span></div>}
                <div className="flex gap-1.5">{row.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </Deck>
        </div>
        <SelectedSummary />
      </div>
    )
  }

  // ── SEMI-SLEEPER ──────────────────────────────────────────────────────────
  // Lower deck: left=LB sleeper, right=Seater chairs
  // Upper deck: left=UB sleeper, right=UB sleeper
  if (kind === 'semi_sleeper') {
    // seats are numbered per row: left-LB, right-Seater, all-UB
    const lbRows = [], seaterRows = [], ubRows = []
    let idx = 0
    for (let r = 0; r < rows; r++) {
      lbRows.push(sorted.slice(idx, idx + left));           idx += left
      seaterRows.push(sorted.slice(idx, idx + right));      idx += right
      ubRows.push(sorted.slice(idx, idx + left + right));   idx += left + right
    }

    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <div className="flex gap-4 overflow-x-auto">
          {/* Lower deck: LB (left) + Seater (right) */}
          <Deck title="Lower deck">
            {lbRows.map((lb, ri) => (
              <div key={ri} className="flex items-end gap-1.5">
                <div className="flex gap-1.5">{lb.map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                <div className="w-4 self-stretch flex items-center justify-center"><span className="text-slate-200 text-xs">│</span></div>
                <div className="flex gap-1.5">{seaterRows[ri].map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </Deck>
          {/* Upper deck: all UB */}
          <Deck title="Upper deck">
            {ubRows.map((ub, ri) => (
              <div key={ri} className="flex items-end gap-1.5">
                <div className="flex gap-1.5">{ub.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                <div className="w-4 self-stretch flex items-center justify-center"><span className="text-slate-200 text-xs">│</span></div>
                <div className="flex gap-1.5">{ub.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </Deck>
        </div>
        <SelectedSummary />
      </div>
    )
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  const lower = sorted.filter(s => s.deck === 'lower')
  const upper = sorted.filter(s => s.deck === 'upper')
  const cols  = left + right
  const mkRows = (list) => { const r = []; for (let i = 0; i < list.length; i += cols) r.push(list.slice(i, i + cols)); return r }
  return (
    <div className="space-y-5">
      <Legend kind="seater" />
      <div className={`flex gap-4 overflow-x-auto ${upper.length ? '' : ''}`}>
        {upper.length > 0 && (
          <Deck title="Lower deck">
            {mkRows(lower).map((row, ri) => (
              <div key={ri} className="flex items-end gap-1.5">
                <div className="flex gap-1.5">{row.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
                {right > 0 && <div className="w-4"><span className="text-slate-200 text-xs">│</span></div>}
                <div className="flex gap-1.5">{row.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              </div>
            ))}
          </Deck>
        )}
        <Deck title={upper.length ? 'Upper deck' : 'Seats'}>
          {mkRows(upper.length ? upper : lower).map((row, ri) => (
            <div key={ri} className="flex items-end gap-1.5">
              <div className="flex gap-1.5">{row.slice(0, left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
              {right > 0 && <div className="w-4"><span className="text-slate-200 text-xs">│</span></div>}
              <div className="flex gap-1.5">{row.slice(left).map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} />)}</div>
            </div>
          ))}
        </Deck>
      </div>
      <SelectedSummary />
    </div>
  )
}

function Legend({ kind }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-7 rounded-lg border-2 border-green-400 bg-white" />
        Available
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-7 rounded-lg border-2 border-green-500 bg-green-50" />
        Selected
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-7 rounded-lg border-2 border-slate-200 bg-slate-100" />
        Sold
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-7 rounded-lg border-2 border-pink-400 bg-pink-50" />
        Ladies
      </div>
    </div>
  )
}

function SelectedSummary() {
  const { selectedSeats } = useBookingStore()
  if (!selectedSeats.length) return null
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-600 mb-1">Selected seats</div>
        <div className="flex gap-2 flex-wrap">
          {selectedSeats.map(s => (
            <span key={s.seat_number} className="bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-lg text-xs font-medium">
              {s.seat_number} — ₹{s.price}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">Total</div>
        <div className="text-xl font-bold text-green-600">₹{selectedSeats.reduce((s, x) => s + x.price, 0)}</div>
      </div>
    </motion.div>
  )
}
