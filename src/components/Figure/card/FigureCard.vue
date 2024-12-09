<script setup lang="ts">
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import type { IFigure, IPrinter } from '@/model/interfaces'
import { figuresKey } from '@/util/injectionKeys'
import { inject } from 'vue'

const figure = inject(figuresKey)

if (!figure) {
  throw new Error('Service is not provided')
}
const { getFiguresData } = figure

const props = defineProps<IFigure & { printerProps?: IPrinter }>()
const deleteFigure = () => {
  toastInstance.addToast(`${props.name} deleted!`, 'warning')
  figuresService.deleteData(props.id).then(() => {
    getFiguresData()
  })
}
</script>

<template>
  <div
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <div class="flex flex-column gap-1">
      <p>{{ isCompleted ? 'Completed' : 'Not completed' }}</p>
      <h2>{{ name }}</h2>
      <p>Perimeter: {{ perimeter }}m</p>
      <button @click="deleteFigure">Delete</button>
    </div>

    <img width="100px" :src="imgUrl ? imgUrl : 'figure.png'" alt="figure-image" />
  </div>
</template>
<style>
.blur {
  backdrop-filter: blur(10px);
}
</style>
