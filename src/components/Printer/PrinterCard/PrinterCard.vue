<script setup lang="ts">
import type { IFigure, IPlasticCoil } from '@/model/interfaces'
import { ref } from 'vue'
import PlasticCoil from '../../PlasticCoil/PlasticCoil.vue'

defineProps<{
  id: string
  name: string
  brand: string
  imgUrl?: string
  coil: IPlasticCoil | null
  queue: IFigure[] | null
}>()

const isPrinting = ref(false)
</script>

<template>
  <li class="flex flex-column shadow-5 p-4 border-round-lg bg-color-soft gap-2">
    <img class="w-7 mx-auto" :src="imgUrl" alt="printer_image" />
    <h2>{{ name }} from {{ brand }}</h2>
    <p>Print status: {{ isPrinting ? 'printing...' : 'offline' }}</p>
    <div class="flex" v-if="!coil">
      <button class="inverted w-full">Add coil</button>
    </div>
    <div v-else class="bg-red flex flex-column px-2 py-3 border-round-lg">
      <h3 class="c-accent">Coil</h3>
      <PlasticCoil :material="coil.material" :color="coil.color" :length="coil.length" />
    </div>

    <p>Queue: {{ queue?.length === 0 ? 'Empty' : queue?.map((item) => item.name).join(', ') }}</p>
    <button @click="isPrinting = !isPrinting">Print</button>
  </li>
</template>

<style></style>
