<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({ mode: { type: String, required: true } })
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
// Determina si el formulario debe ofrecer los campos de registro.
const isSignup = computed(() => props.mode === 'signup')
const name = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const touched = ref(false)
// Valida el formato básico de correo usando una expresión regular.
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
// Exige al menos ocho caracteres para admitir la contraseña.
const passwordValid = computed(() => password.value.length >= 8)
// En registro, exige que la confirmación coincida; en acceso no aplica esa regla.
const confirmValid = computed(() => !isSignup.value || confirmPassword.value === password.value)
// Combina las validaciones comunes con los campos obligatorios del registro.
const formValid = computed(() => emailValid.value && passwordValid.value && (!isSignup.value || (name.value.trim() && lastName.value.trim() && confirmValid.value)))

// Valida el formulario, ejecuta acceso o registro y luego redirige al destino solicitado.
async function submit() {
  touched.value = true
  if (!formValid.value) return
  try {
    if (isSignup.value) await authStore.signup({ name: name.value.trim(), lastName: lastName.value.trim(), email: email.value.trim(), password: password.value })
    else await authStore.signin({ email: email.value.trim(), password: password.value })
    router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
  } catch { /* El mensaje se muestra desde authStore.error. */ }
}
</script>

<template>
  <main class="auth-page">
    <RouterLink class="wordmark auth-wordmark" to="/">Juan<span>TV</span></RouterLink>
    <section class="auth-panel">
      <p class="eyebrow"><span class="eyebrow-mark"></span> TU PRÓXIMA HISTORIA</p>
      <h1>{{ isSignup ? 'Crea tu cuenta' : 'Qué bueno verte' }}</h1>
      <p class="auth-subtitle">{{ isSignup ? 'Un lugar para guardar lo que te mueve.' : 'Vuelve a donde dejaste la historia.' }}</p>
      <form class="auth-form" novalidate @submit.prevent="submit">
        <div v-if="isSignup" class="auth-name-row">
          <label>Nombre<input v-model="name" autocomplete="given-name" required /></label>
          <label>Apellido<input v-model="lastName" autocomplete="family-name" required /></label>
        </div>
        <label>Correo electrónico<input v-model="email" type="email" autocomplete="email" required /><small v-if="touched && email && !emailValid">Ingresa un correo válido.</small></label>
        <label>Contraseña<input v-model="password" type="password" :autocomplete="isSignup ? 'new-password' : 'current-password'" required /><small v-if="touched && !passwordValid">Usa al menos 8 caracteres.</small></label>
        <label v-if="isSignup">Confirmar contraseña<input v-model="confirmPassword" type="password" autocomplete="new-password" required /><small v-if="touched && !confirmValid">Las contraseñas no coinciden.</small></label>
        <p v-if="authStore.error" class="auth-error" role="alert">{{ authStore.error }}</p>
        <button class="button button--primary auth-submit" type="submit" :disabled="authStore.loading">{{ authStore.loading ? 'Un momento…' : isSignup ? 'Crear cuenta' : 'Iniciar sesión' }}</button>
      </form>
      <p class="auth-switch">{{ isSignup ? '¿Ya tienes cuenta?' : '¿Primera vez en JuanTV?' }} <RouterLink :to="isSignup ? '/signin' : '/signup'">{{ isSignup ? 'Inicia sesión' : 'Crea tu cuenta' }}</RouterLink></p>
    </section>
    <span class="auth-orbit auth-orbit--one"></span><span class="auth-orbit auth-orbit--two"></span>
  </main>
</template>
