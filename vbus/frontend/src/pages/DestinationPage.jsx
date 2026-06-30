import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Clock, ShieldCheck, Wallet, Headphones, CheckCircle2, ChevronRight } from 'lucide-react'
import { getDestination } from '../data/destinations'

const mapsLink = (place, city) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place} ${city}`)}`

export default function DestinationPage() {
  const { city } = useParams()
  const navigate = useNavigate()
  const data = getDestination(city)

  useEffect(() => { window.scrollTo(0, 0) }, [city])

  if (!data) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">We don’t have a page for that destination yet.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
      </div>
    )
  }

  const goSearch = (to) => navigate(`/search?from=${data.name}${to ? `&to=${to}` : ''}`)

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-72 sm:h-80 overflow-hidden">
          <img src={data.img} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/20" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
            <Link to="/" className="text-white/70 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
              ← Back to destinations
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">{data.name}</h1>
            <p className="text-white/80 mt-1">{data.state}, India</p>
          </div>
        </div>
      </section>

      {/* Daily services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl font-bold text-slate-900 uppercase tracking-tight mb-4">
          Daily Services from {data.name}
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {data.services.map((to) => (
            <button key={to} onClick={() => goSearch(to)}
              className="shrink-0 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:border-vbus-300 hover:text-vbus-700 transition-colors whitespace-nowrap">
              {data.name} → {to}
            </button>
          ))}
        </div>
      </section>

      {/* Sample schedule card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-vbus-50 border border-vbus-100 rounded-2xl p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-vbus-600" /> Bus Schedule Information
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-vbus-700 mb-2">Premium Electric AC Bus · A/C Sleeper + Seater</div>
              <div className="flex items-center gap-3">
                <div className="text-center"><div className="text-xl font-bold text-slate-900">23:40</div><div className="text-xs text-slate-400">Departure</div></div>
                <div className="flex-1 flex items-center gap-1 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-vbus-500" />
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">8h 10m</span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                <div className="text-center"><div className="text-xl font-bold text-slate-900">07:50</div><div className="text-xs text-slate-400">Arrival</div></div>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-xl font-bold text-vbus-600">₹779</div>
              <div className="text-xs text-green-600 mb-2">25 Seats Available</div>
              <button onClick={() => goSearch(data.services[0])} className="btn-primary text-sm py-2 px-5 w-full sm:w-auto">Book Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">About {data.name}</h2>
        <div className="space-y-3 text-slate-600 leading-relaxed max-w-4xl">
          {data.about.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {/* Places to visit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Places to Visit in {data.name}</h2>
        <ul className="space-y-3 max-w-4xl">
          {data.places.map((pl) => (
            <li key={pl.name} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-vbus-600 shrink-0 mt-0.5" />
              <span className="text-slate-600"><span className="font-semibold text-slate-900">{pl.name}:</span> {pl.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Explore more */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Explore More</h2>
        <p className="text-slate-500 mb-6">Top spots to discover around {data.name}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.places.slice(0, 6).map((pl) => (
            <div key={pl.name} className="glass-card p-5 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-vbus-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-vbus-600" />
              </div>
              <h3 className="font-semibold text-vbus-700">{pl.name}</h3>
              <p className="text-sm text-slate-500 mt-1 flex-1">{pl.desc}</p>
              <a href={mapsLink(pl.name, data.name)} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-vbus-600 hover:text-vbus-700">
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-vbus-50 border-y border-vbus-100 py-12 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Why book {data.name} bus tickets with VBus?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Wallet, t: 'Best Prices', d: 'Exclusive discounts, cashback and zero hidden fees.' },
              { icon: ShieldCheck, t: 'Safe Travel', d: 'Trained crew, CCTV-monitored, GPS-tracked buses.' },
              { icon: Clock, t: 'On-Time', d: 'Punctual departures with live tracking.' },
              { icon: Headphones, t: '24/7 Support', d: 'Round-the-clock help for any query.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="w-10 h-10 rounded-lg bg-vbus-100 flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-vbus-600" /></div>
                <h3 className="font-semibold text-slate-900 mb-1">{t}</h3>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-vbus-600 to-vbus-700 p-8 sm:p-10 text-center shadow-lift">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Book your {data.name} bus tickets</h2>
          <p className="text-white/80 mb-6">Hassle-free booking, instant confirmation, best fares.</p>
          <button onClick={() => goSearch()}
            className="inline-flex items-center gap-2 bg-white text-vbus-700 font-semibold px-6 py-3 rounded-xl hover:bg-vbus-50 transition-all active:scale-95">
            Search Buses <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  )
}
