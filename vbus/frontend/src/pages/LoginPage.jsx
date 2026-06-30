import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bus, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { vEmail, collect } from '../utils/validate'

const AUTH_BG = '/auth-bg.jpg'

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = collect([
      ['email', vEmail(form.email)],
      ['password', form.password ? '' : 'Password is required'],
    ])
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const errCls = (k) => `input-field ${errors[k] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`
  const Err = ({ k }) => errors[k] ? <p className="text-xs text-red-500 mt-1">{errors[k]}</p> : null

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-24">
      <img src={AUTH_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/60 to-vbus-900/60" />
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-vbus-500 to-vbus-700 flex items-center justify-center shadow-lg">
          <Bus className="w-5 h-5 text-white" />
        </span>
        <span className="font-display font-bold text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">V<span className="text-vbus-200">Bus</span></span>
      </Link>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-vbus-500 to-vbus-700 rounded-2xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Welcome back</h1>
          <p className="text-slate-500 text-center text-sm mb-8">Sign in to your VBus account</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={errCls('email')} />
              <Err k="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-vbus-600 hover:text-vbus-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" className={`${errCls('password')} pr-10`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Err k="password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-vbus-600 font-medium hover:text-vbus-700">Sign up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
