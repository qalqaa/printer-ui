import type { ComponentPublicInstance } from 'vue'

export interface ToastInstance extends ComponentPublicInstance {
  addToast: (message: string, status: 'error' | 'success' | 'warning') => void
}
