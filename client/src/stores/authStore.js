import { defineStore } from 'pinia'
import api from '../services/api'

// Recupera el usuario persistido y usa null si no existe o el JSON guardado está dañado.
function storedUser() {
  try { return JSON.parse(localStorage.getItem('juantv-user') || 'null') } catch { return null }
}

export const useAuthStore = defineStore('auth', {
  // Inicializa el estado de autenticación usando los datos de la sesión almacenada.
  state: () => ({ token: localStorage.getItem('juantv-token') || '', user: storedUser(), loading: false, error: '' }),
  // Considera autenticada la sesión solo cuando hay token y datos del usuario.
  getters: { isAuthenticated: (state) => Boolean(state.token && state.user) },
  actions: {
    // Actualiza el estado y persiste el token y los datos públicos recibidos de la API.
    saveSession(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('juantv-token', data.token)
      localStorage.setItem('juantv-user', JSON.stringify(data.user))
    },
    // Envía las credenciales a la API, guarda la sesión y mantiene el error para la interfaz si falla.
    async signin(credentials) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/auth/signin', credentials)
        this.saveSession(data)
        return data.user
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos iniciar sesión.'
        throw error
      } finally { this.loading = false }
    },
    // Crea la cuenta en la API y guarda la sesión devuelta; conserva el error para mostrarlo al usuario.
    async signup(payload) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/auth/signup', payload)
        this.saveSession(data)
        return data.user
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos crear la cuenta.'
        throw error
      } finally { this.loading = false }
    },
    // Borra del estado y del almacenamiento local toda la información de la sesión actual.
    signout() {
      this.token = ''
      this.user = null
      this.error = ''
      localStorage.removeItem('juantv-token')
      localStorage.removeItem('juantv-user')
    },
  },
})
