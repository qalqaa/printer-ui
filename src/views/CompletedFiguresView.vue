<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { useFiguresStore } from '@/stores/figuresStore'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const figuresStore = useFiguresStore()

const loading = ref(true)

const isConfirmMode = ref(false)
const confirmModeHandle = () => {
  isConfirmMode.value = !isConfirmMode.value
}

const deleteAllCompletedFigures = () => {
  toastInstance.addToast('All completed figures deleted!', 'warning')
  for (const item of figuresStore.getCompletedFigures) {
    figuresService.deleteData(item.id)
  }
  figuresStore.deleteAllCompletedFigures()
}

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <DefaultView title="Completed Figures" :otherHandle="confirmModeHandle" :loading>
    <template #list>
      <FigureList
        v-if="figuresStore.getCompletedFigures.length !== 0"
        :items="figuresStore.getCompletedFigures"
      />
      <p v-else>No completed figures found 😒</p>
    </template>
  </DefaultView>
  <DialogWindow
    :isOpen="isConfirmMode"
    @close="confirmModeHandle"
    :onConfirmAction="deleteAllCompletedFigures"
  >
    <template #content>
      <p class="text-xl">Are you sure you want to delete all completed figures?</p>
    </template>
  </DialogWindow>
</template>
