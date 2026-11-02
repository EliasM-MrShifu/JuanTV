<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useListStore } from '../stores/listStore'

const props = defineProps({ categories: { type: Array, default: () => [] } })
const emit = defineEmits(['search', 'category'])
const query = ref('')
const scrolled = ref(false)
const menuOpen = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const listStore = useListStore()
let debounceTimer

// Actualiza el estilo de la barra cuando la página se desplaza más allá del umbral visual.
function updateScroll() {
  scrolled.value = window.scrollY > 24
}
// Espera 300 ms desde la última entrada antes de emitir la búsqueda para evitar llamadas por tecla.
function search() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emit('search', query.value.trim()), 300)
}
// Limpia sesión y datos privados, cierra el menú y navega a la página de inicio.
function signout() {
  authStore.signout()
  listStore.clear()
  menuOpen.value = false
  router.push('/')
}
// Registra el seguimiento de scroll al montar la barra.
onMounted(() => window.addEventListener('scroll', updateScroll, { passive: true }))
// Elimina el listener y cancela cualquier búsqueda pendiente al desmontar la barra.
onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
  clearTimeout(debounceTimer)
})
</script>

<template>
  <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
    <RouterLink class="wordmark" to="/" aria-label="JuanTV, inicio">Juan<span>TV</span></RouterLink>
    <nav class="nav-links" aria-label="Navegación principal">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/mylist">Mi Lista</RouterLink>
      <label class="category-select">
        <span class="sr-only">Filtrar por categoría</span>
        <select aria-label="Categorías" @change="emit('category', $event.target.value)">
          <option value="">Categorías</option>
          <option v-for="category in props.categories" :key="category.slug" :value="category.slug">{{ category.name }}</option>
        </select>
      </label>
    </nav>
    <div class="nav-actions">
      <label class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
        <input v-model="query" type="search" placeholder="Buscar títulos" aria-label="Buscar títulos" @input="search" />
      </label>
      <div v-if="authStore.isAuthenticated" class="account-menu-wrap">
        <button class="avatar-button" type="button" aria-label="Abrir menú de cuenta" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">{{ authStore.user?.name?.[0]?.toUpperCase() || 'J' }}</button>
        <div v-if="menuOpen" class="account-menu"><RouterLink to="/mylist" @click="menuOpen = false">Mi Lista</RouterLink><button type="button" @click="signout">Cerrar sesión</button></div>
      </div>
      <RouterLink v-else class="nav-signin" to="/signin">Entrar</RouterLink>
    </div>
  </header>
</template>
