import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Calendar, Search, ArrowLeftRight } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useSearchStore } from '../../store'
import toast from 'react-hot-toast'

const POPULAR_CITIES = [
  // Andhra Pradesh — West Godavari / Krishna belt (incl. villages & towns)
  'Dwaraka Tirumala', 'Eluru', 'Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Nidadavolu', 'Kovvur',
  'Palakollu', 'Narsapur', 'Gudivada', 'Machilipatnam', 'Jangareddygudem', 'Chintalapudi',
  'Akiveedu', 'Undi', 'Pedavegi', 'Denduluru', 'Bhimadole', 'Pentapadu',
  // Andhra Pradesh — major
  'Vijayawada', 'Guntur', 'Tenali', 'Narasaraopet', 'Ongole', 'Nellore', 'Tirupati',
  'Rajahmundry', 'Kakinada', 'Amalapuram', 'Visakhapatnam', 'Vizianagaram', 'Srikakulam',
  'Kurnool', 'Anantapur', 'Kadapa', 'Chittoor', 'Tadepalle', 'Mangalagiri',
  // Telangana
  'Hyderabad', 'Secunderabad', 'Warangal', 'Khammam', 'Karimnagar', 'Nizamabad', 'Suryapet',
  // Other major South / metros
  'Bangalore', 'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode', 'Pondicherry',
  'Mumbai', 'Pune', 'Delhi', 'Hubli', 'Mysore', 'Goa',
]

export default function SearchForm({ compact = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { search } = useSearchStore()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const passengers = 1
  const [loading, setLoading] = useState(false)
  const [showOriginSug, setShowOriginSug] = useState(false)
  const [showDestSug, setShowDestSug] = useState(false)

  // Pre-fill from URL params (e.g. when coming from DestinationPage)
  useEffect(() => {
    const from = params.get('from')
    const to   = params.get('to')
    const d    = params.get('date')
    if (from) setOrigin(from)
    if (to)   setDestination(to)
    if (d)    setDate(d)
  }, [params.toString()])

  const today    = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const filteredOrigin = POPULAR_CITIES.filter(c => c.toLowerCase().includes(origin.toLowerCase()) && c !== destination)
  const filteredDest   = POPULAR_CITIES.filter(c => c.toLowerCase().includes(destination.toLowerCase()) && c !== origin)

  const swap = () => { setOrigin(destination); setDestination(origin) }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!origin || !destination) return toast.error('Please enter origin and destination')
    if (origin === destination) return toast.error('Origin and destination cannot be same')
    setLoading(true)
    try {
      await search({ origin, destination, travel_date: date, passengers })
      navigate(`/search?from=${origin}&to=${destination}&date=${date}&pax=${passengers}`)
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Shared field shell — label sits inside the field, value below
  const fieldShell = 'flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-4 ' +
    (compact ? 'py-2 ' : 'py-2.5 ') +
    'focus-within:border-vbus-500 focus-within:ring-2 focus-within:ring-vbus-500/20 transition-all'
  const labelCls = 'block text-[11px] uppercase tracking-wider text-slate-400 font-semibold whitespace-nowrap'
  const valueCls = 'w-full bg-transparent outline-none text-slate-900 font-semibold placeholder-slate-400 p-0 ' +
    (compact ? 'text-sm' : 'text-[15px]')

  const Suggestions = ({ items, onPick }) => (
    <div className="absolute top-full mt-2 w-full glass-card py-1 z-50 max-h-60 overflow-y-auto">
      {items.map(c => (
        <div key={c} onMouseDown={() => onPick(c)}
          className="px-4 py-2 text-sm text-slate-700 hover:bg-vbus-50 hover:text-vbus-700 cursor-pointer transition-colors">
          {c}
        </div>
      ))}
    </div>
  )

  return (
    <form onSubmit={handleSearch}>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">

        {/* From */}
        <div className="relative flex-1 min-w-0">
          <div className={fieldShell}>
            <MapPin className="w-5 h-5 text-vbus-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={labelCls}>From</span>
              <input
                value={origin}
                onChange={e => { setOrigin(e.target.value); setShowOriginSug(true) }}
                onFocus={() => setShowOriginSug(true)}
                onBlur={() => setTimeout(() => setShowOriginSug(false), 200)}
                placeholder="From city"
                className={valueCls}
                required
              />
            </div>
          </div>
          {showOriginSug && origin && filteredOrigin.length > 0 &&
            <Suggestions items={filteredOrigin} onPick={c => { setOrigin(c); setShowOriginSug(false) }} />}
        </div>

        {/* Swap */}
        <div className="flex justify-center lg:items-center -my-1 lg:my-0">
          <button type="button" onClick={swap} aria-label="Swap cities"
            className="w-10 h-10 rounded-full bg-vbus-50 border border-slate-200 flex items-center justify-center hover:bg-vbus-100 hover:border-vbus-300 transition-all shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-vbus-600" />
          </button>
        </div>

        {/* To */}
        <div className="relative flex-1 min-w-0">
          <div className={fieldShell}>
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={labelCls}>To</span>
              <input
                value={destination}
                onChange={e => { setDestination(e.target.value); setShowDestSug(true) }}
                onFocus={() => setShowDestSug(true)}
                onBlur={() => setTimeout(() => setShowDestSug(false), 200)}
                placeholder="To city"
                className={valueCls}
                required
              />
            </div>
          </div>
          {showDestSug && destination && filteredDest.length > 0 &&
            <Suggestions items={filteredDest} onPick={c => { setDestination(c); setShowDestSug(false) }} />}
        </div>

        {/* Date */}
        <div className="flex-1 min-w-0">
          <div className={fieldShell}>
            <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={labelCls}>Date of Journey</span>
              <input
                type="date"
                value={date}
                min={today}
                onChange={e => setDate(e.target.value)}
                className={valueCls}
                required
              />
            </div>
          </div>
        </div>

        {/* Departure quick-select */}
        <div className="lg:w-52">
          <div className={fieldShell}>
            <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={labelCls}>Departure</span>
              <div className="flex gap-1.5 mt-1">
                <button type="button" onClick={() => setDate(today)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${date === today ? 'bg-vbus-50 border-vbus-200 text-vbus-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  Today
                </button>
                <button type="button" onClick={() => setDate(tomorrow)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${date === tomorrow ? 'bg-vbus-50 border-vbus-200 text-vbus-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  Tomorrow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <button type="submit" disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 lg:py-2.5 text-base shrink-0">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Search className="w-5 h-5" /> Search</>
          )}
        </button>
      </div>
    </form>
  )
}
