<template>
  <div class="toast-container">
    <div
      v-for="(toast, index) in toasts"
      :key="index"
      :class="['toast', `toast--${toast.status}`]"
      @click="removeToast(index)"
    >
      <strong class="toast__status">{{ toast.status.toUpperCase() }}</strong>
      <p class="toast__message">{{ toast.message }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface ToastMessage {
  message: string
  status: 'error' | 'success' | 'warning'
}

const toasts = ref<ToastMessage[]>([])

const addToast = (message: string, status: 'error' | 'success' | 'warning' = 'error') => {
  toasts.value.push({ message, status })

  setTimeout(() => {
    toasts.value.shift()
  }, 5000)
}

const removeToast = (index: number) => {
  toasts.value.splice(index, 1)
}

defineExpose({ addToast })
</script>

<style scoped>
.toast-container {
  z-index: 9999;
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  /* animation: toast 5s ease-in-out;
  opacity: 0; */
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-radius: 10px;
  color: #fff;
  backdrop-filter: blur(10px) brightness(50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.439);
  transition: all 0.3s ease;
  cursor: pointer;
}

.toast__status {
  font-weight: bold;
  margin-bottom: 8px;
}

.toast--error {
  color: var(--error);
  border: 1px solid var(--error);
}

.toast--success {
  color: var(--accent);
  border: 1px solid var(--accent);
}

.toast--warning {
  color: #f39c12;
  border: 1px solid #f39c12;
}

.toast:hover {
  transform: translateY(-5px);
}

@media (prefers-color-scheme: light) {
  .toast {
    backdrop-filter: blur(10px);
  }

  .toast--warning {
    color: #d88c11;
    border: 1px solid #d88c11;
  }
}
</style>
