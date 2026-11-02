import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './juantv.css'
import App from './App.vue'
import { useAuthStore } from './stores/authStore'
import { useListStore } from './stores/listStore'

const pinia = createPinia()
createApp(App).use(pinia).use(router).mount('#app')
// Al recibir un 401, descarta la sesión y los datos privados antes de enviar al usuario al acceso.
window.addEventListener('juantv:unauthorized', () => {
	useAuthStore(pinia).signout()
	useListStore(pinia).clear()
	router.replace({ name: 'signin' })
})
