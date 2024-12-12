<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { useFiguresStore } from '@/stores/figuresStore'
import { computed, onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const figuresStore = useFiguresStore()
const figuresData = computed(() => {
  return figuresStore.getCompletedFigures
})

const loading = ref(true)

const isConfirmMode = ref(false)
const confirmModeHandle = () => {
  isConfirmMode.value = !isConfirmMode.value
}

onMounted(() => {
  loading.value = false
})

const deleteAllCompletedFigures = () => {
  toastInstance.addToast('All completed figures deleted!', 'warning')
  for (const item of figuresData.value) {
    figuresService.deleteData(item.id)
  }
  figuresStore.deleteAllCompletedFigures()
}
</script>

<template>
  <DefaultView title="Completed Figures" :otherHandle="confirmModeHandle" :loading="loading">
    <template #list>
      <FigureList v-if="figuresData.length !== 0" :items="figuresData" />
      <p v-else>No completed figures found</p>
    </template>
  </DefaultView>
  <DialogWindow
    :isOpen="isConfirmMode"
    @close="confirmModeHandle"
    @confirm-action="deleteAllCompletedFigures"
  >
    <template #content>
      <p class="text-xl">Are you sure you want to delete all completed figures?</p>
    </template>
  </DialogWindow>
</template>
