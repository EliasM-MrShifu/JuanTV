<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const toasts = ref([])
let nextId = 0
// Añade el aviso recibido con un ID único y programa su retirada tras unos segundos.
function addToast(event) {
  const id = ++nextId
  toasts.value.push({ id, ...event.detail })
  window.setTimeout(() => { toasts.value = toasts.value.filter((toast) => toast.id !== id) }, 3600)
}
// Escucha eventos globales para mostrar avisos mientras este componente está montado.
onMounted(() => window.addEventListener('juantv:toast', addToast))
// Desregistra el listener global al desmontar el contenedor de avisos.
onUnmounted(() => window.removeEventListener('juantv:toast', addToast))
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">{{ toast.message }}</div>
  </div>
</template>
