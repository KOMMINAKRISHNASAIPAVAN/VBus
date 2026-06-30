import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Wifi, Zap, Wind, Coffee, Tv, Star, Clock, MapPin, Users, ChevronRight } from 'lucide-react'
import { useBookingStore } from '../../store'

const AMENITY_ICONS = { wifi: Wifi, charging: Zap, ac: Wind, snacks: Coffee, tv: Tv }
const AMENITY_LABELS = { wifi: 'WiFi', charging: 'Charging', ac: 'A/C', blanket: 'Blanket', water: 'Water', snacks: 'Snacks', tv: 'TV', pillow: 'Pillow' }

const BUS_TYPE_COLORS = {
  volvo:        'bg-purple-50 text-purple-700 border border-purple-200',
  luxury:       'bg-amber-50 text-amber-700 border border-amber-200',
  sleeper:      'bg-blue-50 text-blue-700 border border-blue-200',
  semi_sleeper: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  seater:       'bg-green-50 text-green-700 border border-green-200',
}

export default function BusCard({ result, index }) {
  const navigate = useNavigate()
  const { setTrip } = useBookingStore()

  const handleBook = () => {
    setTrip(result)
    navigate(`/booking/${result.trip_id}`)
  }

  const hrs = Math.floor(result.duration_hrs)
  const mins = Math.round((result.duration_hrs - hrs) * 60)
  const durationStr = `${hrs}h ${mins > 0 ? mins + 'm' : ''}`.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-5 hover:border-vbus-300 hover:shadow-lift transition-all duration-300 group"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Bus Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{result.bus.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BUS_TYPE_COLORS[result.bus.bus_type] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {result.bus.bus_type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-amber-600 font-medium">{result.bus.rating}</span>
            <span className="text-xs text-slate-400 ml-1">#{result.bus.number}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.bus.amenities?.slice(0, 5).map(a => {
              const Icon = AMENITY_ICONS[a]
              return (
                <span key={a} className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  {Icon && <Icon className="w-3 h-3 text-vbus-500" />}
                  {AMENITY_LABELS[a] || a}
                </span>
              )
            })}
          </div>
        </div>

        {/* Journey Info */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{result.departure_time}</div>
            <div className="text-xs text-slate-500 mt-0.5">{result.origin.city}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-slate-400">{durationStr}</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-vbus-500" />
              <div className="w-16 md:w-24 h-px bg-gradient-to-r from-vbus-500 to-slate-200" />
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
            <div className="text-xs text-slate-400">{result.distance_km} km</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{result.arrival_time}</div>
            <div className="text-xs text-slate-500 mt-0.5">{result.destination.city}</div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2 md:min-w-36">
          <div className="text-right">
            <div className="text-xs text-slate-400">starts at</div>
            <div className="text-2xl font-bold text-vbus-600">₹{result.base_price}</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            {result.available_seats} seats left
          </div>
          <button onClick={handleBook}
            className="btn-primary flex items-center gap-1 py-2.5 px-5 text-sm whitespace-nowrap">
            Book Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
