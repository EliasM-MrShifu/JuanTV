import { defineStore } from 'pinia'
import api from '../services/api'

export const useListStore = defineStore('personal-list', {
  // Proporciona valores iniciales independientes para listas, historial y estado de solicitudes.
  state: () => ({ myList: [], history: [], recommendations: [], ratings: {}, loading: false, error: '' }),
  getters: {
    // Genera un conjunto de IDs para comprobar rápidamente si una película ya está guardada.
    listIds: (state) => new Set(state.myList.map((movie) => movie._id)),
    // Convierte las entradas del historial en películas y descarta las referencias vacías.
    historyMovies: (state) => state.history.map((entry) => entry.movie).filter(Boolean),
  },
  actions: {
    // Consulta la lista personal, actualiza el estado e informa a la vista de errores de carga.
    async loadMyList() {
      this.loading = true
      try { const { data } = await api.get('/users/mylist'); this.myList = data; return data }
      catch (error) { this.error = error.response?.data?.message || 'No pudimos cargar Mi Lista.'; throw error }
      finally { this.loading = false }
    },
    // Guarda una película y luego sincroniza la lista y las recomendaciones mostradas.
    async add(movieId) {
      await api.post(`/users/mylist/${movieId}`)
      await Promise.all([this.loadMyList(), this.loadRecommendations()])
    },
    // Elimina una película de la API y del estado local, y recalcula las recomendaciones.
    async remove(movieId) {
      await api.delete(`/users/mylist/${movieId}`)
      this.myList = this.myList.filter((movie) => movie._id !== movieId)
      await this.loadRecommendations()
    },
    // Guarda una calificación, actualiza el dato local y carga recomendaciones actualizadas.
    async rate(movieId, score) {
      const { data } = await api.post(`/movies/${movieId}/ratings`, { score })
      this.ratings[movieId] = score
      await this.loadRecommendations()
      return data
    },
    // Registra la reproducción en la API y vuelve a consultar el historial.
    async track(movieId) {
      await api.post(`/users/history/${movieId}`)
      await this.loadHistory()
    },
    // Obtiene el historial del usuario y lo almacena para presentarlo en la aplicación.
    async loadHistory() {
      const { data } = await api.get('/users/history')
      this.history = data
      return data
    },
    // Pide a la API títulos recomendados según la actividad del usuario y guarda el resultado.
    async loadRecommendations() {
      const { data } = await api.get('/movies/recommendations')
      this.recommendations = data
      return data
    },
    // Elimina del estado local todos los datos personalizados al cerrar la sesión.
    clear() {
      this.myList = []
      this.history = []
      this.recommendations = []
      this.ratings = {}
      this.error = ''
    },
  },
})
