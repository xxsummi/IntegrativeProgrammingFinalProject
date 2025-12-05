import { createRouter, createWebHistory } from 'vue-router'
import Inventory from './views/Inventory.vue'

const routes = [
  { path: '/', redirect: '/inventory' },
  { path: '/inventory', name: 'Inventory', component: Inventory }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
