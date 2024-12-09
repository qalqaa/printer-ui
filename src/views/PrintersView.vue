<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import type { MillimeterPerSecond } from '@/model/types'
import { generateIDs } from '@/util/generateIDs'
import { printersKey } from '@/util/injectionKeys'
import { inject, onMounted, ref, watch } from 'vue'
import DefaultView from './DefaultView.vue'
import { CustomError } from '@/model/error/customError'

const printers = inject(printersKey)

if (!printers) {
  throw new Error('Printers service is not provided')
}

const { printersData, getPrintersData } = printers

const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const printerName = ref()
const printerBrand = ref()
const printerSpeed = ref<MillimeterPerSecond>()
const createPrinter = async () => {
  if (printerName.value !== '' && printerBrand.value !== '' && printerSpeed.value !== undefined) {
    printersService
      .postData({
        id: generateIDs(),
        name: printerName.value,
        speed: printerSpeed.value,
        brand: printerBrand.value,
        imgUrl: '3d-printer.png',
        coil: null,
        queue: [],
      })
      .then(() => {
        getPrintersData()
      })
    toastInstance.addToast('Printer created', 'success')
  } else {
    isCreatingModeTrue.value = false
    throw new CustomError('Fill all required fields')
  }
}

// const render = async () => {}

onMounted(() => {
  // render()
})

if (printersData.value.length !== 0) {
  loading.value = false
}

watch(printersData, () => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Printers" :loading="loading" :create-handle="creatingModeHandle">
    <template #list>
      <PrinterList v-if="printersData.length !== 0" :items="printersData" />
      <p v-else>No figures found</p>
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
            <label for="printerName">Enter name</label>
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
            <label for="printerBrand">Enter brand</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="printerBrand"
              id="printerBrand"
              type="text"
            />
          </div>
          <div class="input-box">
            <label for="printerSpeed">Enter speed</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="printerSpeed"
              id="printerSpeed"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
