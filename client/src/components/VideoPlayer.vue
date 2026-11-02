<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({ movie: { type: Object, required: true } })
const emit = defineEmits(['close'])
// Convierte URLs normales de YouTube al reproductor privado o conserva fuentes de vídeo directas.
const source = computed(() => {
  const url = props.movie.videoUrl || ''
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/)
  if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`
  return url
})
// Cierra el reproductor si el usuario presiona Escape.
function onKeydown(event) { if (event.key === 'Escape') emit('close') }
// Bloquea el scroll de fondo y registra Escape mientras el reproductor está visible.
onMounted(() => { document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKeydown) })
// Restaura el scroll y retira el listener cuando el reproductor desaparece.
onUnmounted(() => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <div class="player-backdrop" role="dialog" aria-modal="true" :aria-label="`Reproduciendo ${props.movie.title}`" @click.self="emit('close')">
    <button class="icon-button player-close" type="button" aria-label="Cerrar reproductor" @click="emit('close')"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <iframe v-if="source.includes('youtube')" class="player-frame" :src="source" :title="`Reproduciendo ${props.movie.title}`" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    <video v-else class="player-frame" :src="source" controls autoplay playsinline></video>
  </div>
</template>
