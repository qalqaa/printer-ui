<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { fetchRequest } from '@/data/api/api'
import type { IPrinter } from '@/model/interfaces'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

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
  <DefaultView title="Printers" :loading="loading" :create-handle="creatingModeHandle">
    <template #list>
      <PrinterList :items="printersData" />
    </template>
    <template #dialog>
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
    </template>
  </DefaultView>
</template>
