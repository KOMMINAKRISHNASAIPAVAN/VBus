import { useEffect } from 'react'
import {
  FileText, Globe, Map, BadgeCheck, Wallet, ShieldCheck,
  AlertTriangle, Clock, UserX, Shuffle, CheckCircle2,
} from 'lucide-react'

const TERMS = [
  { icon: Globe,         text: 'VBus is an online booking platform and does not operate buses directly.' },
  { icon: Map,           text: 'Bus schedules, routes, seat availability, boarding and dropping points are controlled by the respective bus operator.' },
  { icon: BadgeCheck,    text: 'Passengers must carry a valid government-issued photo ID during travel.' },
  { icon: Wallet,        text: 'Cancellation and refund policies vary by operator and booking partner.' },
  { icon: ShieldCheck,   text: 'Free Travel Security (Insurance) is subject to insurer eligibility, policy terms and conditions.' },
  { icon: AlertTriangle, text: 'VBus is not liable for delays, breakdowns, weather, traffic disruptions, accidents, route changes, or other unforeseen circumstances.' },
  { icon: Clock,         text: 'Passengers should arrive at the boarding point at least 15 minutes before departure time.' },
  { icon: UserX,         text: 'Boarding may be denied if passenger details provided during booking are incorrect.' },
  { icon: Shuffle,       text: 'Operators reserve the right to change vehicle type, seat number, or boarding point when necessary.' },
  { icon: CheckCircle2,  text: 'By submitting a booking request, you agree to these Terms & Conditions.' },
]

export default function TermsPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-hero-gradient pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-vbus-100 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-vbus-600" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">Terms &amp; Conditions</h1>
          <p className="text-slate-500 mt-2">Please read these terms carefully before booking.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TERMS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="glass-card p-5 flex items-start gap-4 hover:border-vbus-300 hover:shadow-lift transition-all">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-vbus-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-vbus-600" />
              </div>
              <p className="text-slate-700 leading-relaxed text-[15px]">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          VBus Travels · Dwaraka Tirumala, Andhra Pradesh · vbustravels@gmail.com
        </p>
      </div>
    </div>
  )
}
