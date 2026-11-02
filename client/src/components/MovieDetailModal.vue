<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useAuthStore } from '../stores/authStore'
import { useListStore } from '../stores/listStore'
import { useToast } from '../composables/useToast'
import MovieCarousel from './MovieCarousel.vue'
import VideoPlayer from './VideoPlayer.vue'

const route = useRoute()
const router = useRouter()
const movieStore = useMovieStore()
const authStore = useAuthStore()
const listStore = useListStore()
const { showToast } = useToast()
const soundOn = ref(false)
const showPlayer = ref(false)
const ratingPanel = ref(false)
const selectedRating = ref(0)
// Obtiene la película activa del store para compartir sus cambios con el modal.
const movie = computed(() => movieStore.activeMovie)
// Comprueba si la película actual ya forma parte de la lista personal.
const isInList = computed(() => Boolean(movie.value && listStore.myList.some((item) => item._id === movie.value._id)))
// Construye la URL de inserción de YouTube con las opciones de sonido y repetición del modal.
const trailerUrl = computed(() => {
  const url = movie.value?.videoUrl || ''
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=${soundOn.value ? 0 : 1}&loop=1&playlist=${match[1]}&controls=0&playsinline=1` : ''
})

// Cierra el detalle volviendo a la página anterior o al inicio cuando no existe historial útil.
function close() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}
// Reutiliza el cierre del modal cuando se pulsa Escape.
function onKeydown(event) { if (event.key === 'Escape') close() }
// Copia la URL actual al portapapeles y comunica al usuario el resultado.
function share() {
  if (!navigator.clipboard?.writeText) return showToast('El navegador no permite copiar el enlace', 'error')
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('Enlace copiado al portapapeles', 'success'))
    .catch(() => showToast('No pudimos copiar el enlace', 'error'))
}
// Permite acciones personalizadas solo con sesión y redirige al acceso cuando falta.
function requireSession() {
  if (authStore.isAuthenticated) return true
  showToast('Inicia sesión para guardar tu actividad')
  router.push({ name: 'signin', query: { redirect: route.fullPath } })
  return false
}
// Añade o quita la película de Mi Lista y muestra un aviso según el nuevo estado.
async function toggleMyList() {
  if (!requireSession()) return
  try {
    if (isInList.value) await listStore.remove(movie.value._id)
    else await listStore.add(movie.value._id)
    showToast(isInList.value ? 'Agregada a Mi Lista' : 'Quitada de Mi Lista', 'success')
  } catch (error) { showToast(error.response?.data?.message || 'No pudimos actualizar Mi Lista', 'error') }
}
// Envía la puntuación del usuario, actualiza el promedio visible y cierra el selector.
async function rate(score) {
  if (!requireSession()) return
  selectedRating.value = score
  try {
    const result = await listStore.rate(movie.value._id, score)
    movie.value.averageRating = result.averageRating
    movie.value.ratingsCount = result.ratingsCount
    ratingPanel.value = false
    showToast('Tu calificación quedó guardada', 'success')
  } catch (error) { showToast(error.response?.data?.message || 'No pudimos guardar tu calificación', 'error') }
}
// Registra la película en el historial del usuario y muestra el reproductor.
async function openPlayer() {
  if (authStore.isAuthenticated) {
    try { await listStore.track(movie.value._id) }
    catch { showToast('No pudimos actualizar tu historial', 'error') }
  }
  showPlayer.value = true
}
// Navega al detalle de la película similar que el usuario seleccionó.
function selectSimilar(item) { router.push({ name: 'movie-detail', params: { id: item._id } }) }

// Carga el detalle y, si hay sesión, sincroniza la lista y el historial de usuario.
async function loadMovie(id) {
  try { await movieStore.fetchMovie(id) } catch { showToast(movieStore.error, 'error') }
  if (authStore.isAuthenticated) await Promise.all([listStore.loadMyList(), listStore.loadHistory()]).catch(() => {})
}
// Prepara el modal al montarlo, bloqueando scroll y conectando el atajo de teclado.
onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
  loadMovie(route.params.id)
})
// Actualiza el contenido cuando la ruta cambia a otro ID de película.
watch(() => route.params.id, loadMovie)
// Restaura el estado global del documento al retirar el modal.
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="detail-backdrop" role="presentation" @click.self="close">
    <section class="detail-dialog" role="dialog" aria-modal="true" :aria-label="movie?.title || 'Detalle de película'">
      <button class="icon-button detail-close" type="button" aria-label="Cerrar detalle" @click="close"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <div v-if="movie" class="detail-content">
        <div class="detail-media" :style="{ '--detail-image': `url('${movie.bannerImg}')` }">
          <iframe v-if="trailerUrl" :src="trailerUrl" :title="`Trailer de ${movie.title}`" allow="autoplay; encrypted-media; picture-in-picture" class="detail-trailer"></iframe>
          <div class="detail-media-shade"></div>
          <button class="sound-toggle" type="button" :aria-label="soundOn ? 'Desactivar sonido' : 'Activar sonido'" @click="soundOn = !soundOn"><svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path v-if="soundOn" d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/><path v-else d="m16 9 5 6m0-6-5 6"/></svg></button>
          <div class="detail-hero-copy">
            <p class="eyebrow"><span class="eyebrow-mark"></span> JUANTV SELECCIÓN</p>
            <h1>{{ movie.title }}</h1>
            <div class="detail-actions">
              <button class="button button--primary" type="button" @click="openPlayer"><svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z"/></svg>Ver</button>
              <button class="button button--glass" type="button" @click="openPlayer">Trailer</button>
              <button class="round-action" type="button" :aria-label="isInList ? 'Quitar de Mi Lista' : 'Agregar a Mi Lista'" :class="{ selected: isInList }" @click="toggleMyList"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
              <button class="round-action" type="button" aria-label="Calificar" @click="ratingPanel = !ratingPanel"><svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></svg></button>
              <button class="round-action" type="button" aria-label="Compartir" @click="share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4"/></svg></button>
            </div>
            <div v-if="ratingPanel" class="rating-picker" aria-label="Seleccionar calificación">
              <span>Tu calificación</span>
              <button v-for="score in 5" :key="score" type="button" :aria-label="`Calificar con ${score} estrellas`" :class="{ selected: score <= (selectedRating || listStore.ratings[movie._id] || 0) }" @click="rate(score)">★</button>
            </div>
          </div>
        </div>
        <div class="detail-info">
          <div class="detail-description"><div class="detail-metadata"><span>{{ movie.releaseYear }}</span><span>{{ movie.duration }} min</span><span class="rating-chip">★ {{ movie.averageRating?.toFixed(1) || 'Nuevo' }}</span></div><p>{{ movie.description }}</p></div>
          <dl class="detail-facts"><div><dt>Categoría</dt><dd>{{ movie.category?.name || 'Sin categoría' }}</dd></div><div><dt>Dirección</dt><dd>{{ movie.director || 'No disponible' }}</dd></div><div><dt>Reparto</dt><dd>{{ movie.cast?.join(', ') || 'No disponible' }}</dd></div></dl>
        </div>
        <section v-if="movieStore.similar.length" class="similar-section"><h2>Más títulos similares</h2><MovieCarousel title="" :movies="movieStore.similar" @select="selectSimilar" /></section>
      </div>
      <p v-else-if="movieStore.loading" class="detail-loading">Cargando película…</p>
      <p v-else class="detail-loading">{{ movieStore.error || 'No encontramos esta película.' }}</p>
    </section>
    <VideoPlayer v-if="showPlayer && movie" :movie="movie" @close="showPlayer = false" />
  </div>
</template>
