<script setup lang="ts">
import { ref } from 'vue'
import PlasticCoil from '../../PlasticCoil/PlasticCoil.vue'

defineProps<{
  id: string
  name: string
  brand: string
  img?: string
}>()

const isPrinting = ref(false)
</script>

<template>
  <div class="flex flex-column w-2 shadow-5 p-4 border-round-lg bg-color-soft gap-2">
    <!-- <img src="{{img}}" alt="printer_image" /> -->
    <h2>{{ name }} from {{ brand }}</h2>
    <p>Print status: {{ isPrinting ? 'printing...' : 'offline' }}</p>
    <div class="bg-red flex flex-column px-2 py-3 border-round-lg">
      <h3 class="c-accent">Coil</h3>
      <PlasticCoil material="Plastic" color="Red" :length="10" />
    </div>
    <p>Queue: {{}}</p>
    <button @click="isPrinting = !isPrinting">Print</button>
  </div>
</template>

<style></style>
