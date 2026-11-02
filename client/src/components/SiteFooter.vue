<template>
  <footer class="site-footer">
    <RouterLink class="wordmark" to="/">Juan<span>TV</span></RouterLink>
    <p>Historias que encuentran su pantalla.</p>
    <span>© {{ new Date().getFullYear() }} JuanTV</span>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
