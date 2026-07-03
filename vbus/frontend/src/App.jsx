import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ContactFab from './components/layout/ContactFab'
import HomePage from './pages/HomePage'
import DestinationPage from './pages/DestinationPage'
import TermsPage from './pages/TermsPage'
import SearchPage from './pages/SearchPage'
import BookingPage from './pages/BookingPage'
import ConfirmPage from './pages/ConfirmPage'
import TicketPage from './pages/TicketPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MyTripsPage from './pages/MyTripsPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_admin) return <Navigate to="/" replace />
  return children
}

// Auth pages render standalone — no navbar / footer / help button
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

function Shell() {
  const { pathname } = useLocation()
  const isAuthPage = AUTH_ROUTES.includes(pathname)

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/destination/:city" element={<DestinationPage />} />
          <Route path="/terms"        element={<TermsPage />} />
          <Route path="/search"       element={<SearchPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/booking/:tripId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/confirm"      element={<ProtectedRoute><ConfirmPage /></ProtectedRoute>} />
          <Route path="/ticket/:pnr"  element={<TicketPage />} />
          <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-trips"     element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
          <Route path="/admin"        element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ContactFab />}
    </>
  )
}

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)
  useEffect(() => { initAuth() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15,23,42,0.12)' },
          success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
        }}
      />
      <Shell />
    </BrowserRouter>
  )
}
