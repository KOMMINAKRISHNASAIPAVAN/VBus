import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
        return data
      },

      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload)
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
        return data
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    { name: 'vbus-auth', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)

export const useSearchStore = create((set) => ({
  results: [],
  loading: false,
  query: null,

  search: async (params) => {
    set({ loading: true, query: params })
    try {
      const { data } = await api.get('/search/', { params })
      set({ results: data, loading: false })
    } catch {
      set({ results: [], loading: false })
    }
  },

  clearResults: () => set({ results: [], query: null }),
}))

export const useBookingStore = create((set) => ({
  selectedTrip: null,
  selectedSeats: [],
  passengers: [],
  step: 1,

  setTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [], passengers: [], step: 1 }),
  toggleSeat: (seat) => set((s) => {
    const exists = s.selectedSeats.find(x => x.seat_number === seat.seat_number)
    if (exists) {
      return { selectedSeats: s.selectedSeats.filter(x => x.seat_number !== seat.seat_number) }
    }
    return { selectedSeats: [...s.selectedSeats, seat] }
  }),
  setPassengers: (passengers) => set({ passengers }),
  setStep: (step) => set({ step }),
  reset: () => set({ selectedTrip: null, selectedSeats: [], passengers: [], step: 1 }),
}))
