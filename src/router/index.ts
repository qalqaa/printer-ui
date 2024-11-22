import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/printers',
      name: 'printers',
      component: PrinterList,
    },
  ],
})

export default router
