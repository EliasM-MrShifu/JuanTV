<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListStore } from '../stores/listStore'
import { useMovieStore } from '../stores/movieStore'
import Navbar from '../components/Navbar.vue'
import MovieCarousel from '../components/MovieCarousel.vue'

const router = useRouter()
const listStore = useListStore()
const movieStore = useMovieStore()
// Carga las categorías si aún no están disponibles y sincroniza la lista del usuario.
onMounted(() => {
  if (!movieStore.categories.length) movieStore.loadCategories().catch(() => {})
  listStore.loadMyList().catch(() => {})
})
// Navega al detalle de la película seleccionada en la colección personal.
function showDetails(movie) { router.push({ name: 'movie-detail', params: { id: movie._id } }) }
</script>

<template>
  <div class="page-shell">
    <!-- Estos callbacks de navegación conservan únicamente el filtro que el usuario modifica. -->
    <Navbar :categories="movieStore.categories" @search="(title) => router.push({ name: 'search', query: { title: title || undefined } })" @category="(category) => router.push({ name: 'search', query: { category: category || undefined } })" />
    <main class="mylist-main">
      <p class="eyebrow"><span class="eyebrow-mark"></span> TU COLECCIÓN</p>
      <h1>Mi Lista</h1>
      <p v-if="listStore.loading" class="empty-state">Cargando tu lista…</p>
      <MovieCarousel v-else-if="listStore.myList.length" title="Guardadas para después" :movies="listStore.myList" @select="showDetails" />
      <p v-else class="empty-state">Todavía no guardaste títulos. Explora el catálogo y agrega aquí los que quieras ver.</p>
    </main>
  </div>
</template>