import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, CalendarClock, ShieldCheck, Gift, Star, Zap, CheckCircle2 } from 'lucide-react'

const FEATURES = {
  'free-date-change': {
    icon: CalendarClock,
    title: 'Free Date Change',
    tagline: 'Change your travel date at no extra cost.',
    color: 'from-blue-500 to-vbus-600',
    sections: [
      {
        heading: 'What is Free Date Change?',
        body: 'VBus offers you the flexibility to change your travel date without paying any extra charges. Life is unpredictable — and we understand that plans can change at any moment. With Free Date Change, you can reschedule your journey up to 2 hours before departure, completely free of cost.',
      },
      {
        heading: 'How does it work?',
        points: [
          'Go to My Trips and open your booking.',
          'Tap "Change Date" and select your new travel date.',
          'Confirm the change — no extra fee is charged.',
          'Your new e-ticket is sent instantly to your registered mobile number.',
        ],
      },
      {
        heading: 'Terms & Conditions',
        points: [
          'Date change must be requested at least 2 hours before the original departure.',
          'Applicable on all VBus-operated routes.',
          'Seat availability on the new date is subject to availability.',
          'Fare difference (if any) may apply for premium seat upgrades.',
          'Only one free date change is allowed per booking.',
        ],
      },
    ],
  },
  'assurance-program': {
    icon: ShieldCheck,
    title: 'Assurance Program',
    tagline: 'Insure your trip against cancellations and accidents.',
    color: 'from-green-500 to-emerald-600',
    sections: [
      {
        heading: 'What is the VBus Assurance Program?',
        body: 'The VBus Assurance Program is a comprehensive travel protection plan that covers you against unexpected trip cancellations, accidents during travel, and medical emergencies. Travel with complete peace of mind knowing you are protected.',
      },
      {
        heading: 'What does it cover?',
        points: [
          'Trip cancellation due to illness or emergency — full refund.',
          'Accidental injury during travel — medical expense coverage up to ₹1,00,000.',
          'Baggage loss or damage — compensation up to ₹5,000.',
          'Missed connection due to bus delay — alternate travel arrangement.',
          '24/7 emergency helpline support throughout your journey.',
        ],
      },
      {
        heading: 'How to enroll?',
        points: [
          'Select "Add Assurance" during the booking checkout process.',
          'A nominal fee of ₹49 per booking is charged.',
          'Your coverage is active from the moment of booking confirmation.',
          'Claims can be raised via the VBus app or by calling our support line.',
        ],
      },
    ],
  },
  'refer-and-earn': {
    icon: Gift,
    title: 'Refer & Earn',
    tagline: 'Exciting rewards are only a tap away!',
    color: 'from-pink-500 to-rose-600',
    sections: [
      {
        heading: 'What is Refer & Earn?',
        body: 'Share VBus with your friends and family and earn exciting rewards every time someone books using your referral code. The more you refer, the more you earn — it\'s that simple!',
      },
      {
        heading: 'How it works',
        points: [
          'Go to your Profile and tap "Refer & Earn".',
          'Share your unique referral code with friends via WhatsApp, SMS or any app.',
          'When your friend completes their first booking, you earn ₹100 VBus Coins.',
          'Your friend also gets ₹50 off on their first booking.',
          'Coins are credited instantly and can be used on your next trip.',
        ],
      },
      {
        heading: 'Rewards breakdown',
        points: [
          'You earn: ₹100 VBus Coins per successful referral.',
          'Your friend gets: ₹50 discount on first booking.',
          'No limit on referrals — refer unlimited friends.',
          'Coins are valid for 6 months from the date of credit.',
          'Coins can be redeemed on any VBus route.',
        ],
      },
    ],
  },
  'vbus-primo': {
    icon: Star,
    title: 'VBus Primo',
    tagline: 'On-time trips with unmatched comfort, always.',
    color: 'from-amber-500 to-orange-600',
    sections: [
      {
        heading: 'What is VBus Primo?',
        body: 'VBus Primo is our premium membership program designed for frequent travellers who demand the best. Enjoy priority boarding, exclusive discounts, guaranteed on-time departures, and a host of luxury perks on every journey.',
      },
      {
        heading: 'Primo Member Benefits',
        points: [
          'Priority boarding — board before general passengers.',
          'Exclusive 15% discount on all bookings.',
          'Free seat upgrade when premium seats are available.',
          'Dedicated Primo customer support line.',
          'Complimentary snack box on long-distance routes (above 400 km).',
          'Free cancellation up to 1 hour before departure.',
          'Monthly bonus VBus Coins credited to your account.',
        ],
      },
      {
        heading: 'How to subscribe?',
        points: [
          'Go to Profile → VBus Primo.',
          'Choose a plan: Monthly (₹199) or Annual (₹1,499).',
          'Pay securely and your Primo membership activates instantly.',
          'All benefits apply to bookings made after activation.',
        ],
      },
    ],
  },
  'lightning-refund': {
    icon: Zap,
    title: 'Lightning Refund',
    tagline: 'Get instant refunds for your cancellations.',
    color: 'from-violet-500 to-vbus-700',
    sections: [
      {
        heading: 'What is Lightning Refund?',
        body: 'With VBus Lightning Refund, cancelled bookings are refunded to your original payment method within minutes — not days. We believe your money should come back to you as fast as possible.',
      },
      {
        heading: 'How fast is it?',
        points: [
          'UPI payments: refund within 2–5 minutes.',
          'Debit / Credit card: refund within 30 minutes.',
          'Net banking: refund within 2 hours.',
          'Wallet payments: instant credit to wallet.',
        ],
      },
      {
        heading: 'Eligibility',
        points: [
          'Cancellation must be made at least 2 hours before departure for a full refund.',
          'Lightning Refund applies to all VBus-operated routes.',
          'Refund amount depends on the cancellation policy and time of cancellation.',
          'In case of bus cancellation by VBus, 100% refund is processed instantly.',
        ],
      },
    ],
  },
}

export default function FeaturePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const data = FEATURES[slug]

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!data) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Feature page not found.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
      </div>
    )
  }

  const { icon: Icon, title, tagline, color, sections } = data

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${color} pt-20 pb-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-white">{title}</h1>
              <p className="text-white/80 mt-1 text-lg">{tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">{s.heading}</h2>
            {s.body && <p className="text-slate-600 leading-relaxed">{s.body}</p>}
            {s.points && (
              <ul className="space-y-2.5 mt-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-vbus-600 shrink-0 mt-0.5" />
                    <span className="text-slate-600">{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="rounded-2xl bg-gradient-to-r from-vbus-600 to-vbus-700 p-8 text-center shadow-lift">
          <h3 className="font-display text-2xl font-bold text-white mb-2">Ready to experience VBus?</h3>
          <p className="text-white/80 mb-5">Book your next journey and enjoy all these benefits.</p>
          <button onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 bg-white text-vbus-700 font-semibold px-6 py-3 rounded-xl hover:bg-vbus-50 transition-all active:scale-95">
            Search Buses
          </button>
        </div>
      </section>
    </div>
  )
}
