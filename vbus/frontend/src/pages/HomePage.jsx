import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, Clock, Wifi, BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight,
  Phone, Heart, MapPin, Sparkles, Play, Plus, Minus, Star, Send,
  Tag, Gift, Zap, CalendarClock, ShieldCheck, Bus,
} from 'lucide-react'
import SearchForm from '../components/booking/SearchForm'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&q=80&auto=format&fit=crop'

const HERO_CHIPS = [
  { icon: Award,      label: 'Best-in-Class Volvo Buses' },
  { icon: Clock,      label: 'On-Time Guarantee' },
  { icon: Wifi,       label: 'WiFi & Charging' },
  { icon: BadgeCheck, label: 'Verified Gold-Star Crew' },
]

const STATS = [
  { label: 'Happy Passengers', value: '2M+' },
  { label: 'Routes', value: '500+' },
  { label: 'Cities', value: '80+' },
  { label: 'Buses', value: '1200+' },
]

const OFFERS = [
  { code: 'FIRST',    title: 'Save up to ₹250 on bus tickets', valid: 'Valid till 30 Jun' },
  { code: 'SUPERHIT', title: 'Save up to ₹300 on AP & Telangana routes', valid: 'Valid till 30 Jun' },
  { code: 'CASH300',  title: 'Save up to ₹300 on Karnataka, Tamil Nadu & Kerala', valid: 'Valid till 30 Jun' },
  { code: 'VBUS500',  title: 'Save up to ₹500 on first booking', valid: 'Valid till 30 Jun' },
]

const WHATS_NEW = [
  { icon: CalendarClock, title: 'Free Date Change', desc: 'Change your travel date at no extra cost.' },
  { icon: ShieldCheck,   title: 'Assurance Program', desc: 'Insure your trip against cancellations and accidents.' },
  { icon: Gift,          title: 'Refer & Earn', desc: 'Exciting rewards are only a tap away!' },
  { icon: Star,          title: 'VBus Primo', desc: 'On-time trips with unmatched comfort, always.' },
  { icon: Zap,           title: 'Lightning Refund', desc: 'Get instant refunds for your cancellations.' },
]

const OPERATORS = [
  'Sri Ganga Travels', 'ASBR Travels', 'LVP Travels', 'Atluri Travels',
  'Sree KVR Travels', 'Kaveri Travels', 'SVKDT Travels', 'Sri Krishna Travels',
  'Orange Travels', 'Pramukh Travels', 'Zingbus Plus / MAXX', 'IntrCity Travels',
]

const DESTINATIONS = [
  { city: 'Hyderabad',     img: 'https://images.unsplash.com/photo-1696941515998-d83f24967aca?w=600&q=80&auto=format&fit=crop' },
  { city: 'Bangalore',     img: 'https://images.unsplash.com/photo-1708782462555-b3af03b4b3d2?w=600&q=80&auto=format&fit=crop' },
  { city: 'Chennai',       img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80&auto=format&fit=crop' },
  { city: 'Tirupati',      img: 'https://images.unsplash.com/photo-1733805569204-41768c7d8c0f?w=600&q=80&auto=format&fit=crop' },
  { city: 'Visakhapatnam', img: 'https://images.unsplash.com/photo-1609854534028-b512f5246abc?w=600&q=80&auto=format&fit=crop' },
  { city: 'Mumbai',        img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80&auto=format&fit=crop' },
  { city: 'Goa',           img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80&auto=format&fit=crop' },
  { city: 'Kerala',        img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80&auto=format&fit=crop' },
  { city: 'Jaipur',        img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80&auto=format&fit=crop' },
  { city: 'Delhi',         img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80&auto=format&fit=crop' },
  { city: 'Agra',          img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80&auto=format&fit=crop' },
  { city: 'Amritsar',      img: 'https://images.unsplash.com/photo-1623059508779-2542c6e83753?w=600&q=80&auto=format&fit=crop' },
  { city: 'Manali',        img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80&auto=format&fit=crop' },
]

function DestinationsCarousel() {
  const ref = useRef(null)
  const posRef = useRef(0)
  const scroll = (dir) => { posRef.current += dir * 290 }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let paused = false
    let raf
    const enter = () => { paused = true }
    const leave = () => { paused = false }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)

    const SPEED = 2.2  // px per frame — constant glide
    const tick = () => {
      // width of one full set (the second copy begins at this child)
      const reset = el.children[DESTINATIONS.length]?.offsetLeft || el.scrollWidth / 2
      if (!paused) posRef.current += SPEED
      if (posRef.current >= reset) posRef.current -= reset
      if (posRef.current < 0) posRef.current += reset
      el.scrollLeft = posRef.current
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight uppercase">Destinations</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} aria-label="Previous"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-vbus-300 hover:text-vbus-600 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Next"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-vbus-300 hover:text-vbus-600 flex items-center justify-center transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-5 overflow-x-hidden no-scrollbar pb-2">
        {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
          <Link key={d.city + i} to={`/destination/${d.city.toLowerCase()}`} className="shrink-0 w-64 group cursor-pointer block">
            <div className="text-center font-display font-bold text-lg text-vbus-400 mb-2 uppercase tracking-wide">{d.city}</div>
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img src={d.img} alt={d.city} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-vbus-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-vbus-700 font-semibold text-sm px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const WHY_CHOOSE = [
  {
    title: 'Safety First',
    desc: 'We prioritize safety without compromise, consistently applying industry best practices on every trip, across all our routes.',
    img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80&auto=format&fit=crop',
    points: ['Trained Captains', 'Fire Extinguishers', 'Regular Alcohol Checks', 'CCTV Surveillance', 'Strict Speed Limit', 'First-Aid Kits'],
  },
  {
    title: 'Always Punctual',
    desc: 'Our commitment to being a reliable travel companion is reflected in punctual services that respect your time.',
    img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&q=80&auto=format&fit=crop',
    points: ['Real-Time Bus Tracking', 'Scheduled Stops Only', 'Regular Maintenance Checks'],
  },
  {
    title: 'Rewards & Loyalty',
    desc: 'Embark on a rewarding journey with our loyalty program — exclusive member perks and referral rewards on every trip.',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop',
    points: ['Earn VBus Coins', 'Redeem To Book Bus', 'Refer A Friend'],
  },
  {
    title: 'Comfort Redefined',
    desc: 'Our philosophy revolves around offering customers a peaceful, joyful journey. Every bus is designed to unlock comfort.',
    img: 'https://images.unsplash.com/photo-1541534401786-2077eed87a74?w=600&q=80&auto=format&fit=crop',
    points: ['Recliner Seats', 'Clean Pit Stops', 'Noise-Free Cabin', 'Complimentary Delight Box', 'Charging Ports', 'Reading Lights'],
  },
]

const SAFETY_FEATURES = [
  { icon: Phone,    title: '24x7 Women Helpline', sub: 'Always a call away' },
  { icon: Heart,    title: 'Pink Seats',          sub: 'Reserved only for women' },
  { icon: MapPin,   title: 'Live Bus Tracking',   sub: 'Share your trip live' },
  { icon: Sparkles, title: 'Clean Restroom Stops', sub: 'Hygienic & safe' },
]

const FAQS = {
  'Booking/General': [
    ['When should I reach the boarding point?', 'Please arrive at least 15 minutes before the scheduled departure time so boarding stays on schedule.'],
    ['Does booking online cost me more?', 'No. Booking on VBus is free of any extra charge — you pay only the fare shown, with zero hidden fees.'],
    ['Do you have separate seats for ladies passengers?', 'Yes. Pink seats are reserved exclusively for women and are highlighted during seat selection.'],
    ['Are there half-ticket charges for children?', 'Children above 5 years require a full ticket as they occupy a seat. Infants below 5 travel free on a guardian’s lap.'],
    ['Why are different seats priced differently?', 'Pricing depends on seat type (sleeper, semi-sleeper, seater), deck and position — premium seats cost a little more.'],
    ['Can the ticket be transferred to another passenger?', 'Tickets are non-transferable as the name and ID are verified at boarding for safety.'],
    ['Why must I provide a mobile number while booking?', 'Your mobile number is used to send the m-ticket, trip updates and live tracking links.'],
    ['What payment options are available?', 'UPI, all major debit/credit cards, net banking and popular wallets are supported at checkout.'],
  ],
  'Cancellation/Refund': [
    ['How do I cancel my ticket?', 'Go to My Trips, open the booking and tap Cancel. Refunds are processed automatically to the original payment method.'],
    ['What is the cancellation charge?', 'Free cancellation up to 2 hours before departure. Within 2 hours, standard cancellation charges apply.'],
    ['When will I receive my refund?', 'Eligible refunds are credited within 5–7 business days to your original payment method.'],
    ['Amount deducted but ticket not booked — what now?', 'Any failed-transaction amount is auto-reversed within 7 business days. Contact support if it isn’t.'],
  ],
}

function AppleIcon({ className }) {
  return (
    <svg viewBox="0 0 384 512" className={className} aria-hidden="true">
      <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
}

const SEED_REVIEWS = [
  { name: 'Ramesh',  rating: 5, text: 'Very easy booking process and excellent customer support. Highly recommended!', time: '1 day ago' },
  { name: 'Priya',   rating: 5, text: 'Bus arrived on time and seats were very comfortable. Great experience.', time: '3 days ago' },
  { name: 'Suresh',  rating: 5, text: 'Best fares and smooth online booking. Will travel again.', time: '5 days ago' },
  { name: 'Lakshmi', rating: 5, text: 'Safe journey with professional staff and clean buses.', time: '1 week ago' },
  { name: 'Kiran',   rating: 5, text: 'Excellent service from booking to destination. Thank you!', time: '2 weeks ago' },
]

function Stars({ value, onChange, hover, setHover }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onChange ? 'button' : undefined}
          onClick={onChange ? () => onChange(n) : undefined}
          onMouseEnter={setHover ? () => setHover(n) : undefined}
          onMouseLeave={setHover ? () => setHover(0) : undefined}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={`w-5 h-5 ${n <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  )
}

function TestimonialsSection() {
  const [reviews, setReviews] = useState(SEED_REVIEWS)
  const [form, setForm] = useState({ name: '', text: '', rating: 5 })
  const [hover, setHover] = useState(0)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) return
    setReviews([{ name: form.name.trim(), text: form.text.trim(), rating: form.rating, time: 'just now' }, ...reviews])
    setForm({ name: '', text: '', rating: 5 })
    setHover(0)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h2 className="font-display text-3xl font-bold text-slate-900 text-center mb-2">
        <Star className="inline w-7 h-7 text-amber-400 fill-amber-400 -mt-1 mr-1" /> Customer Testimonials
      </h2>
      <p className="text-slate-500 text-center mb-10">Real experiences from VBus travellers</p>

      {/* Add feedback form */}
      <form onSubmit={submit} className="glass-card p-6 max-w-2xl mx-auto mb-10">
        <h3 className="font-semibold text-slate-900 mb-4">Share your experience</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name" className="input-field sm:flex-1" />
          <div className="flex items-center gap-2 sm:px-2">
            <span className="text-sm text-slate-500">Rating:</span>
            <Stars value={form.rating} hover={hover} setHover={setHover} onChange={(n) => setForm({ ...form, rating: n })} />
          </div>
        </div>
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Tell us about your journey…" rows={3} className="input-field resize-none mb-4" />
        <button type="submit" className="btn-primary inline-flex items-center gap-2">
          <Send className="w-4 h-4" /> Submit Feedback
        </button>
      </form>

      {/* Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <motion.div key={r.name + i}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 5) * 0.05 }} viewport={{ once: true }}
            className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-vbus-500 shadow-card p-5">
            <Stars value={r.rating} />
            <p className="text-slate-700 leading-relaxed mt-3 mb-4">{r.text}</p>
            <div className="font-bold text-slate-900">{r.name}</div>
            <div className="text-sm text-slate-400">{r.time}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FaqSection() {
  const tabs = Object.keys(FAQS)
  const [tab, setTab] = useState(tabs[0])
  const [open, setOpen] = useState(0)

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="font-display text-3xl font-bold text-slate-900 text-center mb-2">Frequently Asked Questions</h2>
      <p className="text-slate-500 text-center mb-8">Everything you need to know before you book</p>

      <div className="flex justify-center gap-2 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setOpen(0) }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === t ? 'bg-vbus-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {FAQS[tab].map(([q, a], i) => {
          const isOpen = open === i
          return (
            <div key={q} className="glass-card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="font-medium text-slate-900">{q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-vbus-600 text-white' : 'bg-vbus-50 text-vbus-600'}`}>
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                  className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                  {a}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative min-h-[520px] sm:min-h-[560px] flex items-center overflow-hidden">
          <img src={HERO_IMAGE} alt="Modern VBus luxury coach on the highway at sunset"
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
            <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-medium text-white mb-5">
                <span className="w-1.5 h-1.5 bg-vbus-400 rounded-full animate-pulse" />
                India's fastest growing private bus network
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                A truly{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vbus-300 to-vbus-500">premium</span>
                {' '}travel experience
              </h1>
              <p className="text-lg text-white/80 max-w-lg mb-8 leading-relaxed">
                Book bus tickets across India with VBus — real-time seat selection,
                instant confirmation, zero hidden fees.
              </p>
              <div className="flex flex-wrap gap-3">
                {HERO_CHIPS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-sm font-medium text-white">
                    <Icon className="w-4 h-4 text-vbus-300" /> {label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search bar — straddles the bottom edge of the banner */}
        <motion.div id="search-section"
          initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.6 }}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-20">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Find your bus</h2>
            <SearchForm />
          </div>
        </motion.div>

        <div className="bg-vbus-50 mt-10 py-3.5 text-center">
          <p className="text-sm font-medium text-vbus-800">Your next journey is a VBus away</p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value }) => (
            <div key={label} className="glass-card py-6 text-center">
              <div className="text-3xl font-bold text-vbus-600">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">Offers for you</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFERS.map((o) => (
            <div key={o.code} className="relative rounded-2xl p-5 bg-gradient-to-br from-vbus-600 to-vbus-800 text-white overflow-hidden shadow-card">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
              <h3 className="font-bold text-lg leading-snug mb-1 relative z-10">{o.title}</h3>
              <p className="text-white/70 text-xs mb-4 relative z-10">{o.valid}</p>
              <span className="relative z-10 inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-lg px-3 py-1 text-sm font-semibold">
                <Tag className="w-3.5 h-3.5" /> {o.code}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <DestinationsCarousel />

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-3xl font-bold text-slate-900 whitespace-nowrap">Why Choose Us?</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-vbus-300 to-transparent" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {WHY_CHOOSE.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-vbus-50 to-white p-6 flex items-stretch gap-5 overflow-hidden">
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{c.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {c.points.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-vbus-600 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-28 sm:w-36 shrink-0">
                <img src={c.img} alt={c.title} className="w-full h-full min-h-[150px] object-cover rounded-xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Women Safety banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-pink-100 via-fuchsia-100 to-purple-100 border border-pink-200 px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
            <div className="space-y-4 order-2 md:order-1">
              {SAFETY_FEATURES.slice(0,2).map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-fuchsia-600" />
                  </div>
                  <div className="text-sm"><div className="font-semibold text-slate-800">{title}</div><div className="text-slate-500 text-xs">{sub}</div></div>
                </div>
              ))}
            </div>
            <div className="text-center order-1 md:order-2">
              <div className="text-sm font-medium text-slate-500 tracking-wide">Women</div>
              <div className="font-display text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 leading-none">SAFETY,</div>
              <div className="text-sm font-medium text-slate-500 tracking-wide">Our Priority</div>
            </div>
            <div className="space-y-4 order-3">
              {SAFETY_FEATURES.slice(2).map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 md:justify-end">
                  <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 md:order-2">
                    <Icon className="w-5 h-5 text-fuchsia-600" />
                  </div>
                  <div className="text-sm md:text-right"><div className="font-semibold text-slate-800">{title}</div><div className="text-slate-500 text-xs">{sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's New */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">What's New</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHATS_NEW.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-6 hover:border-vbus-300 hover:shadow-lift transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-vbus-100 flex items-center justify-center mb-4 group-hover:bg-vbus-600 transition-colors">
                <Icon className="w-6 h-6 text-vbus-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{desc}</p>
              <span className="text-sm font-medium text-vbus-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Know More <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bus Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Our Bus Partners</h2>
        <p className="text-slate-500 mb-6">Premium private operators you can trust</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {OPERATORS.map((name) => (
            <div key={name} className="glass-card p-5 flex flex-col items-center text-center hover:border-vbus-300 hover:shadow-lift transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-vbus-100 flex items-center justify-center mb-3 group-hover:bg-vbus-600 transition-colors">
                <Bus className="w-7 h-7 text-vbus-600 group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-slate-800 text-sm leading-tight">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Download the app */}
      <section className="bg-vbus-50 border-y border-vbus-100 py-16 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Travel smarter with the VBus app</h2>
            <p className="text-slate-500 mb-6 max-w-md leading-relaxed">
              Manage bookings, track your bus live, and unlock 100 welcome reward coins — all from your phone.
            </p>
            <div className="flex items-center gap-6">
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-soft">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://vbus.in/app"
                  alt="Scan to download the VBus app" className="w-28 h-28 rounded-md" />
              </div>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-2.5 hover:bg-slate-800 transition-colors">
                  <Play className="w-5 h-5 fill-current" />
                  <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">GET IT ON</span><span className="block text-sm font-semibold -mt-0.5">Google Play</span></span>
                </a>
                <a href="#" className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-2.5 hover:bg-slate-800 transition-colors">
                  <AppleIcon className="w-5 h-5" />
                  <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">Download on the</span><span className="block text-sm font-semibold -mt-0.5">App Store</span></span>
                </a>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-60 h-[440px] rounded-[2.5rem] bg-slate-900 p-2.5 shadow-2xl">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2rem] bg-slate-50 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-br from-vbus-600 to-vbus-800 px-5 pt-8 pb-6 text-white">
                  <div className="text-xs opacity-80">Good evening 👋</div>
                  <div className="font-display font-bold text-lg">Where to today?</div>
                </div>
                <div className="p-4 -mt-4 space-y-3">
                  <div className="bg-white rounded-xl shadow-card p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700"><MapPin className="w-3.5 h-3.5 text-vbus-600" /> Hyderabad</div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center gap-2 text-xs text-slate-700"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Bangalore</div>
                    <div className="bg-vbus-600 text-white text-xs font-semibold rounded-lg py-2 text-center mt-1">Search Buses</div>
                  </div>
                  {[['06:30','VBus Volvo A/C','₹850'],['09:15','VBus Sleeper','₹1100']].map(([t,n,p]) => (
                    <div key={n} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between">
                      <div><div className="text-xs font-bold text-slate-900">{t}</div><div className="text-[10px] text-slate-500">{n}</div></div>
                      <div className="text-vbus-600 font-bold text-sm">{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FaqSection />
    </div>
  )
}
