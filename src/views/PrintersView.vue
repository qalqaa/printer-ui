<script setup lang="ts">
import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { fetchRequest } from '@/data/api/api'
import type { IPrinter } from '@/model/interfaces'
import { onMounted, ref } from 'vue'

const printersData = ref<IPrinter[]>([])
const loading = ref(true)

onMounted(() => {
  fetchRequest<IPrinter[]>({ url: '/printers', method: 'GET' })
    .then((response) => (printersData.value = response))
    .finally(() => (loading.value = false))
  console.log(printersData.value)
})
</script>
<template>
  <main class="flex flex-column align-items-center justify-content-center">
    <div class="flex gap-2 align-items-center">
      <h1>Printers</h1>
      <button>+</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <PrinterList :items="printersData" />
    </div>
  </main>
</template>
