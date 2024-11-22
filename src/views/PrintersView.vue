<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { fetchRequest } from '@/data/api/api'
import type { IPrinter } from '@/model/interfaces'
import { onMounted, ref } from 'vue'

const printersData = ref<IPrinter[]>([])
const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const printerName = ref('')
const printerBrand = ref('')
const createPrinter = async () => {
  if (printerName.value !== '' && printerBrand.value !== '') {
    await fetchRequest<IPrinter>({
      url: '/printers',
      method: 'POST',
      data: {
        name: printerName.value,
        brand: printerBrand.value,
        imgUrl: '3d-printer.png',
        coil: null,
        queue: [],
      },
    })
  }
  render()
}

const render = async () => {
  fetchRequest<IPrinter[]>({ url: '/printers', method: 'GET' })
    .then((response) => (printersData.value = response))
    .finally(() => (loading.value = false))
}

onMounted(() => {
  render()
})
</script>
<template>
  <main class="flex flex-column align-items-center justify-content-center p-5">
    <div class="flex gap-2 align-items-center">
      <h1>Printers</h1>
      <button @click="creatingModeHandle">+</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <PrinterList :items="printersData" />
    </div>
    <DialogWindow
      :isOpen="isCreatingModeTrue"
      @close="creatingModeHandle"
      @confirmAction="createPrinter"
    >
      <template #content>
        <h2>Create a new printer</h2>
        <div class="input-box">
          <label for="printerName">Enter printer name</label>
          <input
            class="w-full"
            required
            placeholder=""
            v-model="printerName"
            id="printerName"
            type="text"
          />
        </div>
        <div class="input-box">
          <label for="printerName">Enter printer brand</label>
          <input
            class="w-full"
            required
            placeholder=""
            v-model="printerBrand"
            id="printerBrand"
            type="text"
          />
        </div>
      </template>
    </DialogWindow>
  </main>
</template>
