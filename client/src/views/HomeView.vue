<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useAuthStore } from '../stores/authStore'
import { useListStore } from '../stores/listStore'
import Navbar from '../components/Navbar.vue'
import HeroBanner from '../components/HeroBanner.vue'
import MovieCarousel from '../components/MovieCarousel.vue'
import SiteFooter from '../components/SiteFooter.vue'

const router = useRouter()
const movieStore = useMovieStore()
const authStore = useAuthStore()
const listStore = useListStore()
const query = ref('')
const category = ref('')
// Agrupa el catálogo por categoría y omite las estanterías sin películas.
const shelves = computed(() => movieStore.categories
  .map((item) => ({ ...item, movies: movieStore.catalog.filter((movie) => movie.category?.slug === item.slug) }))
  .filter((item) => item.movies.length))
// Construye estanterías personalizadas para usuarios autenticados, ordenando o filtrando sus datos.
const personalShelves = computed(() => {
  if (!authStore.isAuthenticated) return []
  return [
    { title: 'Recomendado para vos', movies: listStore.recommendations },
    { title: 'Mi Lista', movies: listStore.myList },
    { title: 'Seguir viendo', movies: listStore.historyMovies },
    { title: 'Mejor calificadas', movies: [...movieStore.catalog].sort((a, b) => b.averageRating - a.averageRating).slice(0, 12) },
    { title: 'Nuevos lanzamientos', movies: [...movieStore.catalog].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 12) },
  ].filter((shelf) => shelf.movies.length)
})

// Guarda el término y navega a la búsqueda conservando el filtro de categoría actual.
function handleSearch(value) {
  query.value = value
  router.push({ name: 'search', query: { title: value || undefined, category: category.value || undefined } })
}
// Actualiza el filtro de categoría y navega manteniendo el término de búsqueda actual.
function handleCategory(value) {
  category.value = value
  router.push({ name: 'search', query: { title: query.value || undefined, category: value || undefined } })
}
// Abre el modal de detalle de la película seleccionada mediante su ruta.
function showDetails(movie) {
  router.push({ name: 'movie-detail', params: { id: movie._id } })
}

// Carga los datos iniciales del catálogo y, con sesión, las secciones personalizadas.
onMounted(() => {
  if (!movieStore.catalog.length) movieStore.loadHome().catch(() => {})
  else movieStore.search().catch(() => {})
  if (authStore.isAuthenticated) {
    listStore.loadMyList().catch(() => {})
    listStore.loadHistory().catch(() => {})
    listStore.loadRecommendations().catch(() => {})
  }
})
</script>

<template>
  <div class="page-shell">
    <Navbar :categories="movieStore.categories" @search="handleSearch" @category="handleCategory" />
    <main>
      <section v-if="movieStore.loading && !movieStore.featured" class="hero hero-skeleton" aria-label="Cargando película destacada"><div class="skeleton-copy"></div></section>
      <HeroBanner v-else-if="movieStore.featured" :movie="movieStore.featured" @play="showDetails" @details="showDetails" />
      <div id="catalogo" class="catalog-content">
        <div v-if="query || category" class="results-context">
          <span>{{ category ? movieStore.categories.find((item) => item.slug === category)?.name : 'Todos los géneros' }}</span>
          <h2>{{ query ? `Resultados para “${query}”` : 'Explorar catálogo' }}</h2>
        </div>
        <p v-if="movieStore.error" class="empty-state">{{ movieStore.error }}</p>
        <div v-else-if="movieStore.loading && !movieStore.catalog.length" class="loading-label">Cargando catálogo…</div>
        <template v-else>
          <MovieCarousel v-for="shelf in shelves" :key="shelf.slug" :title="shelf.name" :movies="shelf.movies" @select="showDetails" />
          <MovieCarousel v-for="shelf in personalShelves" :key="shelf.title" :title="shelf.title" :movies="shelf.movies" @select="showDetails" />
          <p v-if="!shelves.length" class="empty-state">No encontramos títulos con esos filtros. Prueba otra búsqueda.</p>
        </template>
      </div>
    </main>
    <SiteFooter />
    <RouterView />
  </div>
</template>