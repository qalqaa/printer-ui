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
    class="w-screen h-screen left-0 top-0 fixed blur flex items-center justify-content-center align-items-center dialog-card"
  >
    <div
      class="bg-color flex flex-column gap-2 p-4 w-3 pt-5 border-round-lg t relative"
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

.dialog-card {
  z-index: 9999;
  animation: 0.3s ease-in-out fade-in;
}
</style>
