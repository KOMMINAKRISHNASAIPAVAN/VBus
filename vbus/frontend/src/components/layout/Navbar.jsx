import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bus, Menu, X, User, LogOut, Ticket, ChevronDown, Phone } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'text-vbus-700 bg-vbus-50' : 'text-slate-600 hover:text-vbus-600 hover:bg-slate-50'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: logo + nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-vbus-500 to-vbus-700 rounded-xl flex items-center justify-center
                              shadow-sm group-hover:shadow-lg group-hover:shadow-vbus-500/30 transition-shadow">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">V<span className="text-vbus-600">Bus</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/search">Find Buses</NavItem>
              {isAuthenticated && <NavItem to="/my-trips">My Trips</NavItem>}
              {user?.is_admin && <NavItem to="/admin">Admin</NavItem>}
              <NavItem to="/terms">Terms &amp; Conditions</NavItem>
            </div>
          </div>

          {/* Right: auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-vbus-400 hover:shadow-sm transition-all"
                >
                  <div className="w-7 h-7 bg-vbus-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-12 w-48 glass-card py-2"
                    >
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-vbus-600 hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/my-trips" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-vbus-600 hover:bg-slate-50 transition-colors">
                        <Ticket className="w-4 h-4" /> My Trips
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-vbus-600 transition-colors px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-600 hover:text-slate-900">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200 px-4 pb-4 pt-2 space-y-1"
          >
            <NavItem to="/" onClick={() => setMobileOpen(false)}>Home</NavItem>
            <NavItem to="/search" onClick={() => setMobileOpen(false)}>Find Buses</NavItem>
            <NavItem to="/terms" onClick={() => setMobileOpen(false)}>Terms &amp; Conditions</NavItem>
            {isAuthenticated ? (
              <>
                <NavItem to="/my-trips" onClick={() => setMobileOpen(false)}>My Trips</NavItem>
                {user?.is_admin && <NavItem to="/admin" onClick={() => setMobileOpen(false)}>Admin</NavItem>}
                <NavItem to="/profile" onClick={() => setMobileOpen(false)}>Profile</NavItem>
                <button onClick={handleLogout} className="block w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm">Sign Up</Link>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 mt-2 flex gap-2">
              <a href="tel:+918520998910" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
                <Phone className="w-4 h-4 text-vbus-600" /> Call
              </a>
              <a href="https://wa.me/918520998910" target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-sm font-semibold text-white">
                <WhatsAppIcon className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
