import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Edit2, Save } from 'lucide-react'
import { useAuthStore } from '../store'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { vName, vPhone } from '../utils/validate'

export default function ProfilePage() {
  const { user, login } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || 'male' })
  const [loading, setLoading] = useState(false)

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
