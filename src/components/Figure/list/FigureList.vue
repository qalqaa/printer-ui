<script setup lang="ts">
import type { IFigure } from '@/model/interfaces'
import FigureCard from '../card/FigureCard.vue'

defineProps<{ items: IFigure[] }>()
</script>

<template>
  <ul class="list gap-3">
    <FigureCard
      v-for="item in items"
      :key="item.id"
      v-bind="item"
      :name="item.name"
      :perimeter="item.perimeter"
    />
  </ul>
</template>

<style scoped></style>
