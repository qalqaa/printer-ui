import { createApp } from 'vue'
import App from './App.vue'
import './assets/style/main.scss'
import ToastNotification from './components/Toast/ToastNotification.vue'
import type { ToastInstance } from './model/toast/interface'
import router from './router'

const app = createApp(App)
app.use(router)

const toastApp = createApp(ToastNotification)
export const toastInstance = toastApp.mount(document.createElement('div')) as ToastInstance

document.body.appendChild(toastInstance.$el)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Global Error:', err, instance, info)
  if (err instanceof Error) {
    toastInstance.addToast(err.message, 'error')
  } else {
    toastInstance.addToast('Произошла неизвестная ошибка.', 'error')
  }
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
  toastInstance.addToast(event.reason?.message || 'Необработанное исключение в промисе', 'error')
})

window.addEventListener('error', (event) => {
  console.error('Global Error:', event.message)
  toastInstance.addToast(event.message || 'Произошла ошибка', 'error')
})

app.mount('#app')
