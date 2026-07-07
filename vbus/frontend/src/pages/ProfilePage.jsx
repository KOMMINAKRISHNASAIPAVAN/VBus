import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Edit2, Save, Gift, Copy, Share2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { vName, vPhone } from '../utils/validate'

export default function ProfilePage() {
  const { user, login } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || 'male' })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate a stable referral code from user id/email
  const referralCode = `VBUS${(user?.id || '').toString().padStart(4, '0')}${(user?.name || 'X').slice(0,2).toUpperCase()}`
  const referralLink = `https://vbus.onrender.com/?ref=${referralCode}`

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = () => {
    const msg = `🚌 Book bus tickets on VBus and get ₹50 off your first booking!\nUse my referral code: *${referralCode}*\n👉 ${referralLink}`
    if (navigator.share) {
      navigator.share({ title: 'VBus Referral', text: msg, url: referralLink })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  const set = (k) => (e) => {
    const v = k === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  const save = async () => {
    const err = vName(form.name) || vPhone(form.phone, false)
    if (err) return toast.error(err)
    setLoading(true)
    try {
      await api.patch('/users/me', { ...form, name: form.name.trim() })
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient pt-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="glass-card p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-vbus-500 to-vbus-700 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', icon: User, type: 'text' },
              { label: 'Phone', key: 'phone', icon: Phone, type: 'tel' },
            ].map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={type} value={form[key]}
                    onChange={set(key)}
                    disabled={!editing}
                    className={`input-field pl-10 ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Gender</label>
              <select value={form.gender} onChange={set('gender')} disabled={!editing}
                className={`input-field appearance-none ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={user?.email} disabled className="input-field pl-10 opacity-40 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Refer & Earn */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Refer & Earn</h3>
                <p className="text-xs text-slate-500">Earn ₹100 coins per referral · Friend gets ₹50 off</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-pink-200 px-4 py-3 flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Your referral code</p>
                <p className="font-mono font-bold text-lg text-vbus-700 tracking-widest">{referralCode}</p>
              </div>
              <button onClick={copyCode}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-vbus-100 text-vbus-700 hover:bg-vbus-200'
                }`}>
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button onClick={shareReferral}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
              <Share2 className="w-4 h-4" /> Share via WhatsApp
            </button>
            <div className="mt-3 space-y-1.5">
              {[
                'You earn ₹100 VBus Coins per successful referral',
                'Your friend gets ₹50 off on their first booking',
                'No limit — refer unlimited friends',
              ].map(p => (
                <div key={p} className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={save} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
