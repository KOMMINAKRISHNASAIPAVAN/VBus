import { Link } from 'react-router-dom'
import { Bus, Phone, Mail, MapPin, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'

const TOP_ROUTES = [
  'Bangalore to Chennai Bus',
  'Bangalore to Pondicherry Bus',
  'Bangalore to Tirupati Bus',
  'Tirupati to Bangalore Bus',
  'Visakhapatnam to Vijayawada Bus',
  'Hyderabad to Vijayawada Bus',
  'Hyderabad to Guntur Bus',
  'Vijayawada to Hyderabad Bus',
  'Guntur to Hyderabad Bus',
]
const NEW_ROUTES = [
  'Bangalore to Coimbatore Bus',
  'Bangalore to Pondicherry Bus',
  'Vijayawada to Tirupati Bus',
  'Chennai to Tirupati Bus',
  'Bangalore to Chennai Bus',
  'Chennai to Pondicherry Bus',
  'Hyderabad to Eluru Bus',
  'Bangalore to Salem Bus',
  'Bangalore to Erode Bus',
  'Vijayawada to Visakhapatnam Bus',
]
const TOP_CITIES = [
  'Bangalore Bus Ticket Booking',
  'Chennai Bus Ticket Booking',
  'Hyderabad Bus Ticket Booking',
  'Tirupati Bus Ticket Booking',
  'Vijayawada Bus Ticket Booking',
  'Guntur Bus Ticket Booking',
  'Coimbatore Bus Ticket Booking',
  'Visakhapatnam Bus Ticket Booking',
  'Eluru Bus Ticket Booking',
]
const QUICK_LINKS  = [['/', 'Home'], ['/search', 'Find Buses'], ['/my-trips', 'My Trips'], ['/profile', 'Profile']]

function LinkCol({ title, items, asLink }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-slate-500">
        {items.map((it) => {
          const [to, label] = Array.isArray(it) ? it : [null, it]
          return (
            <li key={label}>
              {asLink && to
                ? <Link to={to} className="hover:text-vbus-600 transition-colors">{label}</Link>
                : <span className="hover:text-vbus-600 transition-colors cursor-pointer">{label}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Routes & links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <LinkCol title="Top Bus Routes" items={TOP_ROUTES} />
        <LinkCol title="New Routes" items={NEW_ROUTES} />
        <LinkCol title="Buses From Top Cities" items={TOP_CITIES} />
        <LinkCol title="Quick Links" items={QUICK_LINKS} asLink />
      </div>

      {/* Brand strip */}
      <div className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + about */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-vbus-500 to-vbus-700 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">V<span className="text-vbus-400">Bus</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Premium private bus travel across India. Comfortable, safe and on-time — every journey.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <div key={i} className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-slate-400 hover:bg-vbus-600 hover:text-white cursor-pointer transition-all">
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">About VBus</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {['VBus Coins', 'Membership', 'Group Booking', 'Blogs'].map(x => (
                <li key={x} className="hover:text-white transition-colors cursor-pointer">{x}</li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              {['Privacy Policy', 'FAQs', 'Careers'].map(x => (
                <li key={x} className="hover:text-white transition-colors cursor-pointer">{x}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">VBus Private Limited</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-vbus-400 mt-0.5 shrink-0" /> Dwaraka Tirumala, Andhra Pradesh</li>
              <li>
                <a href="mailto:vbustravels@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-vbus-400 shrink-0" /> vbustravels@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+919391225511" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-vbus-400 shrink-0" /> +91 93912 25511
                </a>
              </li>
              <li>
                <a href="https://wa.me/919391225511" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" /> Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">🚌 VBus Travels</span>
            <span className="mx-2 text-slate-600">·</span>6,500+ Bus Operators
            <span className="mx-2 text-slate-600">·</span>6,56,000+ Routes
          </p>
          <p className="text-xs text-slate-500 mt-2">© 2026 V Bus Travels. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
