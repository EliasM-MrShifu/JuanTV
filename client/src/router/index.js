import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieDetailModal from '../components/MovieDetailModal.vue'
import SearchView from '../views/SearchView.vue'
import AuthView from '../views/AuthView.vue'
import MyListView from '../views/MyListView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, children: [{ path: 'movies/:id', name: 'movie-detail', component: MovieDetailModal }] },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/signin', name: 'signin', component: AuthView, props: { mode: 'signin' }, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: AuthView, props: { mode: 'signup' }, meta: { guestOnly: true } },
    { path: '/mylist', name: 'mylist', component: MyListView, meta: { requiresAuth: true } },
  ],
  // Al navegar, devuelve la página al inicio con desplazamiento animado.
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

// Protege las rutas privadas y evita que una sesión activa vuelva a pantallas de acceso.
router.beforeEach((to) => {
  const authenticated = Boolean(localStorage.getItem('juantv-token'))
  if (to.meta.requiresAuth && !authenticated) return { name: 'signin', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly && authenticated) return { name: 'home' }
  return true
})

export default router
