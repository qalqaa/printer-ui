<script setup lang="ts">
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresKey } from '@/util/injectionKeys'
import { computed, inject, onMounted, ref, watch } from 'vue'
import DefaultView from './DefaultView.vue'

const figures = inject(figuresKey)

if (!figures) {
  throw new Error('Figures service is not provided')
}

const { figuresData, getFiguresData } = figures

const loading = ref(true)

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
</script>

<template>
  <DefaultView title="Completed Figures" :loading="loading">
    <template #list>
      <FigureList v-if="completedFigures.length !== 0" :items="completedFigures" />
      <p v-else>No completed figures found</p>
    </template>
  </DefaultView>
</template>
