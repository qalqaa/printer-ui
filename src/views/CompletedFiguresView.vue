<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { figuresKey } from '@/util/injectionKeys'
import { computed, inject, onMounted, ref, watch } from 'vue'
import DefaultView from './DefaultView.vue'

const figures = inject(figuresKey)

if (!figures) {
  throw new Error('Figures service is not provided')
}

const { figuresData, getFiguresData } = figures

const loading = ref(true)

const isConfirmMode = ref(false)
const confirmModeHandle = () => {
  isConfirmMode.value = !isConfirmMode.value
}

onMounted(() => {
  getFiguresData()
  if (figuresData.value.length === 0) {
    loading.value = false
  }
})

watch(figuresData, () => {
  loading.value = false
})

// Вычисляемое свойство для фильтрации фигур, у которых isCompleted = true
const completedFigures = computed(() => {
  return figuresData.value.filter((figure) => figure.isCompleted)
})

const deleteAllCompletedFigures = () => {
  toastInstance.addToast('All completed figures deleted!', 'warning')
  const allData = figuresService.getData()
  allData.then((data) => {
    const filteredData = data.filter((figure) => figure.isCompleted)
    for (const item of filteredData) {
      figuresService.deleteData(item.id).then(() => {
        getFiguresData()
      })
    }
  })
}
</script>

<template>
  <DefaultView title="Completed Figures" :otherHandle="confirmModeHandle" :loading="loading">
    <template #list>
      <FigureList v-if="completedFigures.length !== 0" :items="completedFigures" />
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
