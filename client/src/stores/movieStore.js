import { defineStore } from 'pinia'
import api from '../services/api'

export const useMovieStore = defineStore('movies', {
  // Define el estado compartido del catálogo, filtros de paginación y película seleccionada.
  state: () => ({
    catalog: [],
    categories: [],
    featured: null,
    activeMovie: null,
    similar: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: '',
  }),
  actions: {
    // Descarga las categorías disponibles y las conserva en el store para filtros y estanterías.
    async loadCategories() {
      try {
        const { data } = await api.get('/categories')
        this.categories = data
        return data
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos cargar las categorías.'
        throw error
      }
    },
    // Carga en paralelo el destacado y las categorías, y después solicita el catálogo inicial.
    async loadHome() {
      this.loading = true
      this.error = ''
      try {
        const [featured, categories] = await Promise.all([api.get('/movies/featured'), api.get('/categories')])
        this.featured = featured.data
        this.categories = categories.data
        const result = await api.get('/movies', { params: { page: 1, limit: 50 } })
        this.catalog = result.data.movies
        return this.catalog
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos cargar el catálogo.'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Consulta títulos con filtros y paginación; anexa páginas siguientes al catálogo existente.
    async search({ title = '', category = '', page = 1, limit = 12 } = {}) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get('/movies', { params: { title: title || undefined, category: category || undefined, page, limit } })
        this.total = data.total
        this.page = data.page
        this.totalPages = data.totalPages
        this.catalog = page > 1 ? [...this.catalog, ...data.movies] : data.movies
        return data
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos buscar esos títulos.'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Recupera el detalle de una película y sus títulos similares para poblar la vista modal.
    async fetchMovie(id) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get(`/movies/${id}`)
        this.activeMovie = data
        const similar = await api.get(`/movies/${id}/similar`)
        this.similar = similar.data
        return data
      } catch (error) {
        this.error = error.userMessage || error.response?.data?.message || 'No pudimos cargar esta película.'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Limpia el detalle y los títulos similares cuando se cierra la película activa.
    clearActiveMovie() {
      this.activeMovie = null
      this.similar = []
    },
  },
})
