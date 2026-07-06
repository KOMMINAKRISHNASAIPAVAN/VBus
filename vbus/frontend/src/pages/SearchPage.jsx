import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, SortAsc, BusFront } from 'lucide-react'
import { useSearchStore } from '../store'
import SearchForm from '../components/booking/SearchForm'
import BusCard from '../components/booking/BusCard'

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer rounded-lg w-40" />
          <div className="h-3 shimmer rounded-lg w-24" />
          <div className="flex gap-2">
            {[1,2,3].map(i=><div key={i} className="h-6 w-16 shimmer rounded-lg" />)}
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 w-20 shimmer rounded-lg ml-auto" />
          <div className="h-8 w-28 shimmer rounded-xl ml-auto" />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [params] = useSearchParams()
  const { results, loading, search } = useSearchStore()

  useEffect(() => {
    const from = params.get('from')
    const to   = params.get('to')
    const date = params.get('date')
    const pax  = params.get('pax') || 1
    if (from && to && date) {
      search({ origin: from, destination: to, travel_date: date, passengers: Number(pax) })
    }
  }, [params.get('from'), params.get('to'), params.get('date'), params.get('pax')])

  const from = params.get('from')
  const to   = params.get('to')
  const date = params.get('date')

  return (
    <div className="min-h-screen bg-hero-gradient pt-16">
      {/* Compact Search Bar */}
      <div className="bg-white border-b border-slate-200 shadow-soft py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {from && to ? `${from} → ${to}` : 'Bus Search Results'}
            </h1>
            {date && <p className="text-sm text-slate-500 mt-0.5">{date} · {results.length} buses found</p>}
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 flex items-center gap-2 hover:border-vbus-300 hover:text-vbus-600 transition-all">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 flex items-center gap-2 hover:border-vbus-300 hover:text-vbus-600 transition-all">
              <SortAsc className="w-4 h-4" /> Sort
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : results.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="glass-card p-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BusFront className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No buses found</h3>
              <p className="text-slate-500">Try a different route or date.</p>
            </motion.div>
          ) : (
            results.map((result, i) => <BusCard key={result.trip_id} result={result} index={i} />)
          )}
        </div>
      </div>
    </div>
  )
}
