import axios from 'axios'

// In production (Render static site) VITE_API_URL points to the backend host.
// In dev it's empty, so we use '/api' which the Vite proxy forwards to :8000.
let API = import.meta.env.VITE_API_URL || ''
if (API && !/^https?:\/\//.test(API)) API = 'https://' + API

const api = axios.create({
  baseURL: (API ? API : '') + '/api',
  timeout: 20000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vbus-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
