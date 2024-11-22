<script setup lang="ts">
import PrinterCard from '../PrinterCard/PrinterCard.vue'

defineProps<{ items: string[] }>()
</script>

<template>
  <ul>
    <PrinterCard id="1" name="iPrinter" brand="Apple" />
  </ul>
</template>

<style></style>
