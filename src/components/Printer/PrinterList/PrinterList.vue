<script setup lang="ts">
import type { IPrinter } from '@/model/interfaces'
import PrinterCard from '../PrinterCard/PrinterCard.vue'
defineProps<{ items: IPrinter[] }>()
</script>

<template>
  <ul class="list gap-3 px-3">
    <PrinterCard
      v-for="item in items"
      :key="item.id"
      v-bind="item"
      :name="item.name"
      :brand="item.brand"
      :coil="item.coil"
      :queue="item.queue"
    />
  </ul>
</template>

<style></style>
