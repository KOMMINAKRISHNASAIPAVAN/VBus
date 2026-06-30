import { motion } from 'framer-motion'
import { useBookingStore } from '../../store'
import { clsx } from 'clsx'

function SeatIcon({ seat, selected, onToggle }) {
  const status = seat.status

  const selectable = status === 'available' || status === 'ladies'

  const cls = clsx(
    'relative w-9 h-10 rounded-t-xl border-2 transition-all duration-150 flex flex-col items-center justify-end pb-1 text-xs font-medium select-none',
    selectable && selected && 'seat-selected shadow-lg shadow-vbus-500/40 scale-105',
    status === 'available' && !selected && 'seat-available',
    status === 'ladies'    && !selected && 'seat-ladies',
    status === 'booked'    && 'seat-booked cursor-not-allowed',
    status === 'locked'    && 'seat-booked cursor-not-allowed opacity-70',
  )

  return (
    <motion.button
      whileHover={selectable ? { scale: 1.08 } : {}}
      whileTap={selectable ? { scale: 0.95 } : {}}
      onClick={() => selectable && onToggle(seat)}
      disabled={!selectable}
      className={cls}
      title={`Seat ${seat.seat_number} — ₹${seat.price}${status === 'ladies' ? ' (Ladies seat — women only)' : status !== 'available' ? ` (${status})` : ''}`}
    >
      {/* Headrest bumps */}
      <div className="absolute -top-1.5 left-1.5 right-1.5 flex gap-1">
        <div className="flex-1 h-2 rounded-full bg-current opacity-30" />
        <div className="flex-1 h-2 rounded-full bg-current opacity-30" />
      </div>
      <span className="text-[10px]">{seat.seat_number}</span>
    </motion.button>
  )
}

export default function SeatMap({ seats }) {
  const { selectedSeats, toggleSeat } = useBookingStore()
  const selected = (s) => !!selectedSeats.find(x => x.seat_number === s.seat_number)

  const lower = seats.filter(s => s.deck === 'lower').sort((a,b) => +a.seat_number - +b.seat_number)
  const upper = seats.filter(s => s.deck === 'upper').sort((a,b) => +a.seat_number - +b.seat_number)

  // Build rows: 2 seats | aisle | 2 seats
  const buildRows = (seatList) => {
    const rows = []
    for (let i = 0; i < seatList.length; i += 4) {
      rows.push(seatList.slice(i, i + 4))
    }
    return rows
  }

  const renderDeck = (seatList, label) => {
    if (!seatList.length) return null
    const rows = buildRows(seatList)
    return (
      <div>
        {label && <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">{label} Deck</div>}
        {/* Bus outline */}
        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 pt-8">
          {/* Steering */}
          <div className="absolute top-3 left-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
            <span className="text-xs text-slate-400">Driver</span>
          </div>
          {/* Door */}
          <div className="absolute top-3 right-4 w-5 h-8 border border-slate-300 rounded-sm flex items-center justify-center">
            <span className="text-[8px] text-slate-400 rotate-90">Door</span>
          </div>

          <div className="space-y-2 mt-2">
            {rows.map((row, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 text-right">{ri+1}</span>
                <div className="flex gap-1.5">
                  {row.slice(0,2).map(s => <SeatIcon key={s.seat_number} seat={s} selected={selected(s)} onToggle={toggleSeat} />)}
                </div>
                <div className="w-5 text-center text-xs text-slate-300">│</div>
                <div className="flex gap-1.5">
                  {row.slice(2).map(s => <SeatIcon key={s.seat_number} seat={s} selected={selected(s)} onToggle={toggleSeat} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[['seat-available','Available'],['seat-selected','Selected'],['seat-booked','Booked'],['seat-ladies','Ladies']].map(([cls,label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-5 h-6 rounded-t-lg border-2 ${cls}`} />
            <span className="text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {upper.length > 0
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderDeck(lower, 'Lower')}
            {renderDeck(upper, 'Upper')}
          </div>
        : renderDeck(lower, '')}

      {/* Selected summary */}
      {selectedSeats.length > 0 && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
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
            <div className="text-xl font-bold text-vbus-600">
              ₹{selectedSeats.reduce((sum,s) => sum + s.price, 0)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
