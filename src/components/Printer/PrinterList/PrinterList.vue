<script setup lang="ts">
import type { IPrinter } from '@/model/interfaces'
import PrinterCard from '../PrinterCard/PrinterCard.vue'
defineProps<{ items: IPrinter[] }>()
</script>

<template>
  <ul class="printer-list gap-3 px-3">
    <PrinterCard
      v-for="item in items"
      :key="item.id"
      v-bind="item"
      :name="item.name"
      :brand="item.brand"
      :img="item.imgUrl"
      :coil="item.coil"
      :queue="item.queue"
    />
  </ul>
</template>

<style>
.printer-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* grid-template-rows: repeat(2, 1fr); */
}

@media (max-width: 1200px) {
  .printer-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .printer-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
