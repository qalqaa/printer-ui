<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ isOpen: boolean; onConfirmAction: () => void }>()

const emit = defineEmits(['close'])

const modal = ref<HTMLDivElement | null>(null)

const handleClose = () => emit('close')

const handleOverlayClick = (event: MouseEvent) => {
  if (modal.value && !modal.value.contains(event.target as Node)) {
    handleClose()
  }
}

const handleConfirm = () => {
  props.onConfirmAction()
  handleClose()
}

const handleEscKey = (event: KeyboardEvent) => {
  if (props.isOpen && event.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})
</script>
<template>
  <div
    v-if="isOpen"
    @click="handleOverlayClick"
    class="w-screen h-screen left-0 top-0 fixed flex items-center justify-content-center align-items-center dialog-window"
  >
    <div
      class="bg-color flex flex-column gap-2 p-4 pt-5 border-round-lg t relative dialog-card"
      ref="modal"
    >
      <button @click="handleClose" class="inverted absolute top-0 right-0 m-2">x</button>
      <slot name="content">Default content</slot>
      <button @click="handleConfirm">Submit</button>
    </div>
  </div>
</template>

<style>
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.dialog-window {
  z-index: 9998;
  backdrop-filter: blur(10px) brightness(50%);
  animation: 0.3s ease-in-out fade-in;
  width: 100%;
}

@media (max-width: 768px) {
  .dialog-card {
    width: 83%;
  }
}

@media (prefers-color-scheme: light) {
  .dialog-window {
    backdrop-filter: blur(10px) brightness(95%);
  }
}
</style>
