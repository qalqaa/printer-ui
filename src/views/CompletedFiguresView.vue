<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { useModeSwitcher } from '@/composables/useModeSwitcher'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { useFiguresStore } from '@/stores/figuresStore'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const figuresStore = useFiguresStore()

const loading = ref(true)

const { isModeActive, toggleMode } = useModeSwitcher()

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
  <DefaultView title="Completed Figures" :otherHandle="() => toggleMode('confirm')" :loading>
    <template #list>
      <FigureList
        v-if="figuresStore.getCompletedFigures.length !== 0"
        :items="figuresStore.getCompletedFigures"
      />
      <p v-else>No completed figures found 😒</p>

      <DialogWindow
        :isOpen="isModeActive('confirm')"
        @close="toggleMode('confirm')"
        :onConfirmAction="deleteAllCompletedFigures"
      >
        <template #content>
          <p class="text-xl">
            Are you sure you want to delete <span class="c-accent">ALL</span> completed figures?
          </p>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
