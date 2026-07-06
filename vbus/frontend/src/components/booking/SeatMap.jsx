import { motion } from 'framer-motion'
import { useBookingStore } from '../../store'

// ── Seat cell ─────────────────────────────────────────────────────────────────
// type: 'sleeper' | 'seater'
function Seat({ seat, selected, onToggle, type = 'seater' }) {
  const { status, price, seat_number } = seat
  const isSold  = status === 'booked' || status === 'blocked' || status === 'locked'
  const isLady  = status === 'ladies'
  const canPick = !isSold

  const color = selected ? { box: 'border-green-500 bg-green-50', pill: 'bg-green-300', text: 'text-green-700' }
              : isSold   ? { box: 'border-slate-200 bg-slate-100', pill: 'bg-slate-200', text: 'text-slate-400' }
              : isLady   ? { box: 'border-pink-400 bg-pink-50',   pill: 'bg-pink-200',  text: 'text-pink-600' }
              :             { box: 'border-green-400 bg-white',    pill: 'bg-green-100', text: 'text-slate-700' }

  if (type === 'sleeper') {
    // tall berth — horizontal orientation (lies along bus length)
    return (
      <motion.button
        whileHover={canPick ? { scale: 1.04 } : {}}
        whileTap={canPick   ? { scale: 0.96 } : {}}
        onClick={() => canPick && onToggle(seat)}
        disabled={!canPick}
        title={`${seat_number} ₹${price}${isSold ? ' (Sold)' : isLady ? ' (Ladies)' : ''}`}
        className={`relative w-full h-10 rounded-xl border-2 ${color.box} flex items-center justify-between px-2 ${canPick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        {/* pillow at left end */}
        <div className={`w-2 h-6 rounded-md ${color.pill} flex-shrink-0`} />
        <div className="flex flex-col items-center flex-1">
          <span className={`text-[10px] font-bold ${color.text}`}>{seat_number}</span>
          <span className={`text-[9px] ${color.text} opacity-80`}>{isSold ? 'Sold' : `₹${price}`}</span>
        </div>
        {selected && <span className="text-green-600 text-xs font-bold">✓</span>}
      </motion.button>
    )
  }

  // seater — chair shape (upright)
  return (
    <motion.button
      whileHover={canPick ? { scale: 1.06 } : {}}
      whileTap={canPick   ? { scale: 0.94 } : {}}
      onClick={() => canPick && onToggle(seat)}
      disabled={!canPick}
      title={`${seat_number} ₹${price}${isSold ? ' (Sold)' : isLady ? ' (Ladies)' : ''}`}
      className={`flex flex-col items-center gap-0.5 ${canPick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className={`w-11 h-12 rounded-t-xl border-2 ${color.box} relative flex flex-col justify-end`}>
        {/* headrest */}
        <div className={`absolute -top-1.5 left-1.5 right-1.5 flex gap-1`}>
          <div className={`flex-1 h-2 rounded-full ${color.pill}`} />
          <div className={`flex-1 h-2 rounded-full ${color.pill}`} />
        </div>
        {/* seat base */}
        <div className={`w-full h-3 rounded-b-lg ${color.pill} opacity-60`} />
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${color.text}`}>
          {isSold ? 'Sold' : seat_number}
        </span>
      </div>
      <span className={`text-[10px] font-medium ${color.text}`}>{isSold ? '' : `₹${price}`}</span>
    </motion.button>
  )
}

// ── Deck panel ────────────────────────────────────────────────────────────────
function DeckPanel({ title, showSteering, children }) {
  return (
    <div className="flex-1 min-w-[160px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-700">{title}</span>
        {showSteering && (
          <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300" />
          </div>
        )}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
        {children}
      </div>
    </div>
  )
}

// ── Aisle divider ─────────────────────────────────────────────────────────────
function Aisle() {
  return <div className="self-stretch w-px bg-slate-200 mx-1" />
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
  // Render as columns: each column = one seat position running front→back
  // left columns | aisle | right columns
  if (kind === 'seater') {
    const cols = left + right
    // build column arrays: col[c] = seats in that column position
    const columns = Array.from({ length: cols }, (_, c) =>
      sorted.filter((_, i) => i % cols === c)
    )
    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <DeckPanel title="Seats" showSteering>
          <div className="flex gap-1 items-start">
            {/* left columns */}
            {columns.slice(0, left).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2 flex-1">
                {col.map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="seater" />)}
              </div>
            ))}
            {right > 0 && <Aisle />}
            {/* right columns */}
            {columns.slice(left).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2 flex-1">
                {col.map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="seater" />)}
              </div>
            ))}
          </div>
        </DeckPanel>
        <SelectedSummary />
      </div>
    )
  }

  // ── SLEEPER ───────────────────────────────────────────────────────────────
  // Lower deck = LB berths, Upper deck = UB berths
  // Each berth rendered horizontally (lying down), stacked front→back
  // left cols | aisle | right cols  (each col = one berth-column)
  if (kind === 'sleeper') {
    const cols = left + right
    const lb = sorted.filter(s => s.seat_type === 'lower' || s.deck === 'lower')
    const ub = sorted.filter(s => s.seat_type === 'upper' || s.deck === 'upper')

    const sleeperCols = (list) => Array.from({ length: cols }, (_, c) =>
      list.filter((_, i) => i % cols === c)
    )

    const renderSleeperDeck = (list, title) => {
      const colArrays = sleeperCols(list)
      return (
        <DeckPanel title={title} showSteering={title === 'Lower deck'}>
          <div className="flex gap-2 items-start">
            {colArrays.slice(0, left).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1.5 flex-1">
                {col.map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="sleeper" />)}
              </div>
            ))}
            {right > 0 && <Aisle />}
            {colArrays.slice(left).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1.5 flex-1">
                {col.map(s => <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="sleeper" />)}
              </div>
            ))}
          </div>
        </DeckPanel>
      )
    }

    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <div className="flex flex-col md:flex-row gap-4">
          {renderSleeperDeck(lb, 'Lower deck')}
          {renderSleeperDeck(ub, 'Upper deck')}
        </div>
        <SelectedSummary />
      </div>
    )
  }

  // ── SEMI-SLEEPER ──────────────────────────────────────────────────────────
  // Left cols: LB block (left_rows) + UB block (left_rows) — independent
  // Right cols: Seater block (right_seater_rows) + UB block (right_ub_rows) — independent
  if (kind === 'semi_sleeper') {
    const leftRows        = +(layout?.left_rows          ?? rows)
    const rightSeaterRows = +(layout?.right_seater_rows  ?? rows)
    const rightUbRows     = +(layout?.right_ub_rows      ?? rows)

    const mkCols = (arr, cols) => Array.from({ length: cols }, (_, c) =>
      arr.filter((_, i) => i % cols === c)
    )

    let idx = 0
    const lbAll      = sorted.slice(idx, idx + leftRows * left);             idx += leftRows * left
    const ubLeftAll  = sorted.slice(idx, idx + leftRows * left);             idx += leftRows * left
    const seaterAll  = sorted.slice(idx, idx + rightSeaterRows * right);     idx += rightSeaterRows * right
    const ubRightAll = sorted.slice(idx, idx + rightUbRows * right)

    const lbCols      = mkCols(lbAll,      left)
    const ubLeftCols  = mkCols(ubLeftAll,  left)
    const seaterCols  = mkCols(seaterAll,  right)
    const ubRightCols = mkCols(ubRightAll, right)

    return (
      <div className="space-y-5">
        <Legend kind={kind} />
        <div className="flex flex-col md:flex-row gap-4">
          <DeckPanel title="Lower deck" showSteering>
            <div className="flex gap-2 items-start">
              {lbCols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5 flex-1">
                  {col.map(s => s && <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="sleeper" />)}
                </div>
              ))}
              <Aisle />
              {seaterCols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-2 flex-1">
                  {col.map(s => s && <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="seater" />)}
                </div>
              ))}
            </div>
          </DeckPanel>
          <DeckPanel title="Upper deck">
            <div className="flex gap-2 items-start">
              {ubLeftCols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5 flex-1">
                  {col.map(s => s && <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="sleeper" />)}
                </div>
              ))}
              <Aisle />
              {ubRightCols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5 flex-1">
                  {col.map(s => s && <Seat key={s.seat_number} seat={s} selected={sel(s)} onToggle={toggleSeat} type="sleeper" />)}
                </div>
              ))}
            </div>
          </DeckPanel>
        </div>
        <SelectedSummary />
      </div>
    )
  }

  return null
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ kind }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-5 rounded-lg border-2 border-green-400 bg-white" />
        Available
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-5 rounded-lg border-2 border-green-500 bg-green-50" />
        Selected
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-5 rounded-lg border-2 border-slate-200 bg-slate-100" />
        Sold
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-5 rounded-lg border-2 border-pink-400 bg-pink-50" />
        Ladies
      </div>
    </div>
  )
}

// ── Selected summary ──────────────────────────────────────────────────────────
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
