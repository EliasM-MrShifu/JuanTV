import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

// Añade el token guardado a cada petición para que la API pueda identificar la sesión.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('juantv-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Traduce errores de API a mensajes de interfaz y cierra la sesión cuando el servidor responde 401.
api.interceptors.response.use((response) => response, (error) => {
  if (!error.response) {
    error.userMessage = 'No se puede conectar con la API. Inicia el servidor y verifica MongoDB Atlas en server/.env.'
  } else if (error.response.data?.message) {
    error.userMessage = error.response.data.message
  }
  if (error.response?.status === 401 && localStorage.getItem('juantv-token')) {
    localStorage.removeItem('juantv-token')
    window.dispatchEvent(new CustomEvent('juantv:unauthorized'))
  }
  return Promise.reject(error)
})

export default api
