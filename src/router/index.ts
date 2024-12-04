import CoilsView from '@/views/CoilsView.vue'
import PrintersView from '@/views/PrintersView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'printers',
      component: PrintersView,
    },
    {
      path: '/coils',
      name: 'coils',
      component: CoilsView,
    },
  ],
})

export default router
