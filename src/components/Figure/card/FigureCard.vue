<script setup lang="ts">
import type { IFigure, IPrinter } from '@/model/interfaces'

defineProps<IFigure & { printerProps?: IPrinter }>()
</script>

<template>
  <div
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <div class="flex flex-column gap-1">
      <h2>{{ name }}</h2>
      <p>Perimeter: {{ perimeter }}</p>
    </div>
    <img width="100px" :src="imgUrl ? imgUrl : 'figure.png'" alt="figure-image" />
  </div>
</template>
<style>
.blur {
  backdrop-filter: blur(10px);
}
</style>
