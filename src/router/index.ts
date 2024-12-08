import CoilsView from '@/views/CoilsView.vue'
import FiguresView from '@/views/FiguresView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
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
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView,
    },
    {
      path: '/coils',
      name: 'coils',
      component: CoilsView,
    },
    {
      path: '/figure-library',
      name: 'figure-library',
      component: FiguresView,
    },
  ],
})

export default router
