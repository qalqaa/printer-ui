<script setup lang="ts">
import type { IPrinter } from '@/model/interfaces'
import { onMounted } from 'vue'
import PrinterCard from '../PrinterCard/PrinterCard.vue'

const props = defineProps<{ items: IPrinter[] }>()
onMounted(() => console.log(props.items))
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
  grid-template-columns: repeat(4, 1fr);
  /* grid-template-rows: repeat(2, 1fr); */
}
</style>
