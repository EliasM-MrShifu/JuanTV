<script setup>
import { ref } from 'vue'

const props = defineProps({ title: { type: String, required: true }, movies: { type: Array, default: () => [] } })
const emit = defineEmits(['select'])
const track = ref(null)
// Desplaza la fila horizontalmente en la dirección solicitada usando un paso proporcional al ancho.
function move(direction) {
  track.value?.scrollBy({ left: direction * Math.max(track.value.clientWidth * 0.82, 240), behavior: 'smooth' })
}
// Si falla el póster, evita reintentos y usa la miniatura del tráiler cuando se puede obtener.
function fallbackPoster(event, movie) {
  if (event.target.dataset.fallback) return
  const trailerId = movie.videoUrl?.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/)?.[1]
  if (!trailerId) return
  event.target.dataset.fallback = 'true'
  event.target.src = `https://i.ytimg.com/vi/${trailerId}/hqdefault.jpg`
}
</script>

<template>
  <section class="shelf" :aria-label="props.title">
    <div class="shelf-heading"><h2>{{ props.title }}</h2><div class="shelf-controls"><button type="button" aria-label="Desplazar a la izquierda" @click="move(-1)"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" aria-label="Desplazar a la derecha" @click="move(1)"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button></div></div>
    <div ref="track" class="movie-track">
      <button v-for="(movie, index) in props.movies" :key="movie._id" class="movie-card" type="button" :aria-label="`Ver detalles de ${movie.title}`" @click="emit('select', movie)">
        <span class="movie-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <img :src="movie.coverImg" :alt="movie.title" loading="lazy" @error="fallbackPoster($event, movie)" />
        <span class="movie-card-info"><strong>{{ movie.title }}</strong><small>{{ movie.releaseYear }} <span>•</span> {{ movie.category?.name }}</small></span>
        <span class="movie-hover-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg></span>
      </button>
    </div>
  </section>
</template>
