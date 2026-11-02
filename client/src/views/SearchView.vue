<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import Navbar from '../components/Navbar.vue'
import MovieCarousel from '../components/MovieCarousel.vue'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const movieStore = useMovieStore()
const { showToast } = useToast()
const title = ref(String(route.query.title || ''))
const category = ref(String(route.query.category || ''))

// Consulta una página de resultados con los filtros actuales y notifica errores de búsqueda.
async function load(page = 1) {
  try { await movieStore.search({ title: title.value, category: category.value, page, limit: 12 }) }
  catch { showToast(movieStore.error, 'error') }
}
// Actualiza el término de búsqueda en estado y URL, y reinicia los resultados desde la primera página.
function setTitle(value) {
  title.value = value
  router.replace({ query: { ...route.query, title: value || undefined } })
  load(1)
}
// Actualiza la categoría en estado y URL, y vuelve a consultar desde la primera página.
function setCategory(value) {
  category.value = value
  router.replace({ query: { ...route.query, category: value || undefined } })
  load(1)
}
// Abre el detalle del título elegido usando su ID en la ruta.
function showDetails(movie) { router.push({ name: 'movie-detail', params: { id: movie._id } }) }
// Sincroniza los filtros locales y recarga los resultados cuando cambian parámetros de URL.
watch(() => route.query, (query) => {
  title.value = String(query.title || '')
  category.value = String(query.category || '')
  load(1)
})
// Obtiene categorías para el filtro y ejecuta la primera búsqueda de la página.
onMounted(() => {
  if (!movieStore.categories.length) movieStore.loadCategories().catch(() => {})
  load(1)
})
</script>

<template>
  <div class="page-shell search-page">
    <Navbar :categories="movieStore.categories" @search="setTitle" @category="setCategory" />
    <main class="search-main">
      <p class="eyebrow"><span class="eyebrow-mark"></span> DESCUBRIR</p>
      <h1>{{ title ? `Resultados para “${title}”` : 'Explorar películas' }}</h1>
      <p class="search-count">{{ movieStore.total }} títulos disponibles</p>
      <p v-if="movieStore.loading && !movieStore.catalog.length" class="empty-state">Cargando resultados…</p>
      <MovieCarousel v-else-if="movieStore.catalog.length" :title="category || 'Resultados'" :movies="movieStore.catalog" @select="showDetails" />
      <p v-else class="empty-state">No encontramos títulos con esos filtros. Prueba otra búsqueda.</p>
      <button v-if="movieStore.page < movieStore.totalPages" class="button button--glass load-more" type="button" :disabled="movieStore.loading" @click="load(movieStore.page + 1)">{{ movieStore.loading ? 'Cargando…' : 'Cargar más' }}</button>
    </main>
  </div>
</template>
