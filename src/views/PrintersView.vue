<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PrinterList from '@/components/Printer/PrinterList/PrinterList.vue'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useIds } from '@/composables/useIds'
import { printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { IPrinter } from '@/model/interfaces'
import { usePrintersStore } from '@/stores/printersStore'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const printersStore = usePrintersStore()

const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const { fields, errors, validateFields } = useFieldValidation(
  {
    printerName: '',
    printerBrand: '',
    printerSpeed: 0,
  },
  {
    printerName: (value) => value !== '',
    printerBrand: (value) => value !== '',
    printerSpeed: (value) => value !== undefined && value > 0,
  },
)

const createPrinter = async () => {
  if (fields.printerSpeed.value <= 0) {
    isCreatingModeTrue.value = false
    errors.printerSpeed.value = true
    throw new CustomError("Speed can't be negative or null")
  }
  if (validateFields()) {
    const postedPrinter: IPrinter = {
      id: useIds(),
      name: fields.printerName.value,
      speed: fields.printerSpeed.value,
      brand: fields.printerBrand.value,
      imgUrl: '3d-printer.png',
      coil: null,
      queue: [],
    }
    printersStore.addPrinter(postedPrinter)
    printersService.postData(postedPrinter)
    toastInstance.addToast(fields.printerName.value + ' created', 'success')
  } else {
    throw new CustomError('Fill all required fields')
  }
}

onMounted(() => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Printers" :loading="loading" :create-handle="creatingModeHandle">
    <template #list>
      <PrinterList
        v-if="printersStore.getPrinters.length !== 0"
        :items="printersStore.getPrinters"
      />
      <p v-else>No printers found🤨</p>
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
              v-model="fields.printerName.value"
              :class="{ 'user-invalid': errors.printerName.value }"
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
              v-model="fields.printerBrand.value"
              :class="{ 'user-invalid': errors.printerBrand.value }"
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
              v-model="fields.printerSpeed.value"
              :class="{ 'user-invalid': errors.printerSpeed.value }"
              id="printerSpeed"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
