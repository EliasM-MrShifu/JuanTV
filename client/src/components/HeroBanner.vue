<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ movie: { type: Object, required: true } })
const emit = defineEmits(['play', 'details'])
const bannerImage = ref(props.movie.bannerImg)
// Mantiene la imagen del banner sincronizada si el padre reemplaza la película destacada.
watch(() => props.movie.bannerImg, (image) => { bannerImage.value = image })

// Si falla la imagen principal, extrae el ID de YouTube del tráiler y prueba su miniatura.
function fallbackBanner() {
  const trailerId = props.movie.videoUrl?.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/)?.[1]
  if (trailerId) bannerImage.value = `https://i.ytimg.com/vi/${trailerId}/hqdefault.jpg`
}
</script>

<template>
  <section class="hero" :style="{ '--hero-image': `url('${bannerImage}')` }" aria-labelledby="hero-title">
    <img class="hero-image-check" :src="bannerImage" alt="" aria-hidden="true" @error="fallbackBanner" />
    <div class="hero-content">
      <p class="eyebrow"><span class="eyebrow-mark"></span> JUANTV ORIGINAL</p>
      <h1 id="hero-title">{{ props.movie.title }}</h1>
      <p class="hero-meta"><span>{{ props.movie.releaseYear }}</span><span class="meta-divider"></span><span>{{ props.movie.duration }} min</span><span class="meta-divider"></span><span>{{ props.movie.category?.name }}</span></p>
      <p class="hero-description">{{ props.movie.description }}</p>
      <div class="hero-actions">
        <button class="button button--primary" type="button" @click="emit('play', props.movie)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg>Reproducir</button>
        <button class="button button--glass" type="button" @click="emit('details', props.movie)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>Más información</button>
      </div>
    </div>
    <div class="hero-index"><span>01</span><i></i><span>08</span></div>
    <div class="hero-gradient"></div>
  </section>
</template>
