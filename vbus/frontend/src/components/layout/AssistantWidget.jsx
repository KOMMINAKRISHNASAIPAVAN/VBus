import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send } from 'lucide-react'

const GREETING = "Hi! I'm the VBus Assistant 🤖 How can I help you today?"

const QUICK_REPLIES = ['How do I book?', 'Cancellation & refund', 'Payment options', 'Talk to a human']

function getReply(text) {
  const t = text.toLowerCase()
  if (/(book|ticket|reserve)/.test(t))
    return "To book: enter your From & To cities and date on the home page, hit Search, pick a bus, choose your seats, add passenger details and pay. You'll get an instant m-ticket with a PNR."
  if (/(cancel|refund)/.test(t))
    return "Free cancellation up to 2 hours before departure. Open My Trips → select the booking → Cancel. Eligible refunds reach your original payment method in 5–7 business days."
  if (/(pay|payment|upi|card)/.test(t))
    return "We accept UPI, all major debit/credit cards, net banking and popular wallets — with zero hidden fees."
  if (/(seat|ladies|women|pink)/.test(t))
    return "You can pick seats live on the seat map. Pink seats are reserved exclusively for women and are clearly marked."
  if (/(track|live|where)/.test(t))
    return "Once booked, you can track your bus live from My Trips and share the live link with family."
  if (/(price|fare|cost|cheap)/.test(t))
    return "Fares vary by seat type and route. Popular routes start around ₹350 (Mumbai–Pune) to ₹1200 (Hyderabad–Mumbai)."
  if (/(human|agent|call|phone|whatsapp|support|contact)/.test(t))
    return "Sure! Call us at +91 8520998910 or tap WhatsApp from the contact button. Our team is happy to help."
  if (/(route|city|cities|destination)/.test(t))
    return "We cover 500+ routes across 80+ cities — Hyderabad, Bangalore, Chennai, Mumbai, Delhi, Pune and more. Try the search box on the home page!"
  if (/(hi|hello|hey|thanks|thank)/.test(t))
    return "Happy to help! Ask me about booking, seats, payments, cancellations or tracking. 😊"
  return "I'm not sure about that one. You can ask about booking, seats, payments, cancellations or tracking — or tap WhatsApp to chat with our team."
}

export default function AssistantWidget({ open, onClose }) {
  const [messages, setMessages] = useState([{ from: 'bot', text: GREETING }])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = (text) => {
    const msg = text.trim()
    if (!msg) return
    setInput('')
    setMessages(m => [...m, { from: 'user', text: msg }])
    setTimeout(() => setMessages(m => [...m, { from: 'bot', text: getReply(msg) }]), 350)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="fixed bottom-44 right-6 z-50 w-[20rem] sm:w-[22rem] h-[26rem] max-h-[70vh] bg-white rounded-2xl shadow-lift border border-slate-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-vbus-600 to-vbus-800 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">VBus Assistant</div>
              <div className="text-xs text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online
              </div>
            </div>
            <button onClick={onClose} aria-label="Close assistant" className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-vbus-600 text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Quick replies (only before user types) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-vbus-200 text-vbus-700 hover:bg-vbus-50 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(input) }}
            className="p-3 border-t border-slate-200 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-vbus-500/30"
            />
            <button type="submit" aria-label="Send"
              className="w-9 h-9 rounded-full bg-vbus-600 hover:bg-vbus-700 text-white flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
