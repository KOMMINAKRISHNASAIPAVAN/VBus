import { useNavigate } from 'react-router-dom'

export default function ConfirmPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Confirm your booking</h1>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    </div>
  )
}
