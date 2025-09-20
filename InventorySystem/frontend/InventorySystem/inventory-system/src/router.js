import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Inventory from './views/Inventory.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/inventory', name: 'Inventory', component: Inventory }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
