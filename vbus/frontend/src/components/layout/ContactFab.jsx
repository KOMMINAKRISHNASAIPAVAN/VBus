import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Phone, X, Plus, Bot } from 'lucide-react'
import AssistantWidget from './AssistantWidget'
import WhatsAppIcon from './WhatsAppIcon'

const PHONE = '+919391225511'
const WHATSAPP = 'https://wa.me/919391225511'

export default function ContactFab() {
  const [open, setOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)

  return (
    <>
      <AssistantWidget open={assistantOpen} onClose={() => setAssistantOpen(false)} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Contact options (expand from the + button) */}
        <AnimatePresence>
          {open && (
            <>
              <motion.a
                href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="flex items-center gap-3 bg-white shadow-lift border border-slate-200 rounded-full pl-4 pr-2 py-2"
              >
                <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                <span className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <WhatsAppIcon className="w-5 h-5" />
                </span>
              </motion.a>
              <motion.a
                href={`tel:${PHONE}`}
                initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-3 bg-white shadow-lift border border-slate-200 rounded-full pl-4 pr-2 py-2"
              >
                <span className="text-sm font-medium text-slate-700">Call us</span>
                <span className="w-10 h-10 rounded-full bg-vbus-600 flex items-center justify-center text-white">
                  <Phone className="w-5 h-5" />
                </span>
              </motion.a>
            </>
          )}
        </AnimatePresence>

        {/* + contact button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close contact options' : 'Contact us'}
          className="w-14 h-14 rounded-full bg-vbus-600 hover:bg-vbus-700 text-white shadow-lift flex items-center justify-center transition-colors active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.span>
              : <motion.span key="p" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Plus className="w-6 h-6" /></motion.span>}
          </AnimatePresence>
        </button>

        {/* Assistant — "Click for Help" pill, below the + button */}
        <button
          onClick={() => setAssistantOpen(o => !o)}
          aria-label="Open assistant"
          className="flex items-center gap-3 bg-white rounded-full shadow-lift pl-2 pr-5 py-2 hover:shadow-xl transition-shadow active:scale-95"
        >
          <span className="relative w-14 h-14 shrink-0">
            <span className="absolute bottom-0 left-1.5 w-4 h-4 bg-vbus-700 rotate-45 rounded-[3px]" />
            <span className="relative block w-14 h-14 rounded-full shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="helpGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <path id="helpArc" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <circle cx="50" cy="50" r="49" fill="url(#helpGrad)" />
                <text fill="#ffffff" fontSize="11.5" fontWeight="700" letterSpacing="1.5">
                  <textPath href="#helpArc" startOffset="0">VBUS SUPPORT • VBUS SUPPORT • </textPath>
                </text>
              </svg>
              <Bot className="absolute inset-0 m-auto w-6 h-6 text-white" />
            </span>
          </span>
          <span className="font-bold text-slate-800 whitespace-nowrap">Click for Help</span>
        </button>
      </div>
    </>
  )
}
