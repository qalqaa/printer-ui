<script setup lang="ts">
import CoilCard from '@/components/Coil/card/CoilCard.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureCard from '@/components/Figure/card/FigureCard.vue'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useSimulateErrors } from '@/composables/useSimulateErrors'
import { coilsService, figuresService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { useCoilsStore } from '@/stores/coilsStore'
import { useFiguresStore } from '@/stores/figuresStore'
import { usePrintersStore } from '@/stores/printersStore'
import { ref } from 'vue'
import ProgressBar from '../ProgressBar/ProgressBar.vue'

const props = defineProps<IPrinter>()

const isPrinting = ref(false)

console.log()

const printersStore = usePrintersStore()
const coilsStore = useCoilsStore()
const figuresStore = useFiguresStore()

const coilsData = coilsStore.getCoils

// const incompleteFigures = computed(() => {
//   return figuresData.value.filter((figure) => !figure.isCompleted)
// })

const isRefillMode = ref(false)
const isQueueMode = ref(false)
const isEditingMode = ref(false)
const selectedCoil = ref<ICoil | 'placeholder'>('placeholder')
const selectedFigure = ref<IFigure | 'placeholder'>('placeholder')

const { fields, errors, validateFields } = useFieldValidation(
  {
    printerName: props.name,
    printerBrand: props.brand,
    printerSpeed: props.speed,
  },
  {
    printerName: (value) => value !== '',
    printerBrand: (value) => value !== '',
    printerSpeed: (value) => value !== undefined && value > 0,
  },
)

const queueHandle = () => {
  // figuresData.value = figuresStore.getBlueprints
  if (figuresStore.getBlueprints.length === 0 && !isQueueMode.value) {
    throw new CustomError('No figures, create at least one in figures tab')
  }
  isQueueMode.value = !isQueueMode.value
}

const refillHandle = () => {
  if (coilsData.length === 0) {
    throw new CustomError('No coils, create at least one in coils tab')
  }
  isRefillMode.value = !isRefillMode.value
}

const editHandle = () => {
  isEditingMode.value = !isEditingMode.value
}

const editPrinter = () => {
  if (fields.printerSpeed.value <= 0) {
    errors.printerSpeed.value = true
    throw new CustomError("Speed can't be negative or null")
  }
  if (validateFields()) {
    const editedPrinter: IPrinter = {
      ...props,
      name: fields.printerName.value,
      brand: fields.printerBrand.value,
      speed: fields.printerSpeed.value,
    }
    printersStore.updatePrinter(editedPrinter)
    printersService.updateData(props.id, editedPrinter)
    toastInstance.addToast('Printer edited!', 'success')
  } else {
    throw new CustomError('Invalid fields')
  }
}

const addToQueue = () => {
  if (selectedFigure.value !== 'placeholder') {
    if (!props.queue) {
      printersService.updateData(props.id, { ...props, queue: [selectedFigure.value] })
    } else {
      printersService.updateData(props.id, {
        ...props,
        queue: [...props.queue, selectedFigure.value],
      })
    }
    printersStore.addToQueue(props.id, selectedFigure.value)

    toastInstance.addToast(`${selectedFigure.value.name} added to queue!`, 'success')
    figuresStore.deleteFigure(selectedFigure.value.id)
    figuresService.deleteData(selectedFigure.value.id)
    selectedFigure.value = 'placeholder'
    return
  }
  throw new CustomError('Choose a figure!')
}

const refill = () => {
  if (isPrinting.value) {
    throw new CustomError('Cannot remove coil while printing')
  }
  if (props.coil) {
    throw new CustomError('Coil is already installed')
  }
  if (selectedCoil.value !== 'placeholder') {
    printersStore.addCoil(props.id, selectedCoil.value)
    coilsStore.deleteCoil(selectedCoil.value.id)
    printersService.updateData(props.id, { ...props, coil: selectedCoil.value })
    coilsService.deleteData(selectedCoil.value.id)
    toastInstance.addToast('Coil refilled!', 'success')
    return
  }
  throw new CustomError('Choose a coil!')
}

const progress = ref(0)

const print = (): void => {
  if (!props.queue || props.queue.length === 0) {
    throw new CustomError('No figures in queue')
  }

  if (!props.coil) {
    throw new CustomError('No coil inside printer, first refill it')
  }

  isPrinting.value = true
  const currentFigure = props.queue[0]
  const perimeterPrintedFigure = currentFigure.perimeter
  const onePercentTime = (perimeterPrintedFigure * 10000) / props.speed
  const filamentPerTick = Math.round((perimeterPrintedFigure / 100) * 1000)

  if (!props.coil || props.coil.length < perimeterPrintedFigure) {
    isPrinting.value = false
    throw new CustomError('Coil is too short')
  }

  const timer = setInterval(() => {
    const error = useSimulateErrors(progress.value)

    if (error) {
      clearInterval(timer)
      isPrinting.value = false

      switch (error.type) {
        case 'thread':
          toastInstance.addToast(error.message, 'error')
          return

        case 'nozzle':
          progress.value = 0
          toastInstance.addToast(error.message, 'error')
          if (!props.queue) return
          printersStore.removeFromQueue(props.id, props.queue[0].id)
          printersService.updateData(props.id, {
            ...props,
            queue: props.queue.slice(1),
          })
          return

        case 'electricity':
          toastInstance.addToast(error.message, 'error')
          return
      }
    }

    if (progress.value < 100 && props.coil) {
      progress.value++
      console.log(filamentPerTick)
      printersStore.shortenCoil(props.id, filamentPerTick)
    } else {
      if (!props.coil || !props.queue || props.queue.length === 0) {
        return
      }

      toastInstance.addToast(`${currentFigure.name} is printed!`, 'success')
      figuresStore.addFigure({ ...currentFigure, color: props.coil.color, isCompleted: true })
      figuresService.postData({
        ...currentFigure,
        color: props.coil.color,
        isCompleted: true,
      })
      printersStore.removeFromQueue(props.id, props.queue[0].id)
      printersService
        .updateData(props.id, {
          ...props,
          queue: props.queue.slice(1),
          coil: { ...props.coil, length: props.coil.length },
        })
        .then(() => {
          clearInterval(timer)
          isPrinting.value = false

          if (props.queue!.length > 0) {
            progress.value = 0
            print()
          }
          progress.value = 0
        })
    }
  }, onePercentTime)
}

const deletePrinter = () => {
  toastInstance.addToast(props.name + ' deleted!', 'warning')
  printersService.deleteData(props.id)
  printersStore.deletePrinter(props.id)
}
</script>

<template>
  <li
    class="flex flex-column shadow-5 p-4 border-round-lg bg-color-soft gap-2 justify-content-between relative"
  >
    <button
      :class="{ disabled: isPrinting }"
      @click="deletePrinter"
      class="absolute pt-2 top-0 right-0 m-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-trash"
        viewBox="0 0 16 16"
      >
        <path
          d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
        />
        <path
          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
        />
      </svg>
      <!-- Да, да знаю, что нельзя, но пощадите пожалуйста, пол второго ночи -->
    </button>
    <button
      :class="{ disabled: isPrinting }"
      @click="editHandle"
      class="absolute pt-2 top-0 right-0 m-2 mr-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-pen-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001"
        />
      </svg>
    </button>
    <div class="flex flex-column gap-2">
      <img class="w-7 mx-auto" :src="imgUrl" alt="printer_image" />
      <h2>{{ name }} from {{ brand }}</h2>

      <div class="flex" v-if="!coil">
        <button @click="refillHandle" class="inverted w-full">Add coil</button>
      </div>
      <ul v-else class="flex flex-column px-2 py-3 border-round-lg">
        <h3 class="c-accent">Coil</h3>
        <CoilCard
          :printer-props="props"
          :id="coil.id"
          :material="coil.material"
          :color="coil.color"
          :length="coil.length"
          :is-printing="isPrinting"
        />
      </ul>

      <ul class="flex flex-column px-2 py-3 border-round-lg gap-2" v-if="queue?.length">
        <h3 class="c-accent">Queue</h3>
        <FigureCard
          v-for="item in props.queue"
          :key="item.id"
          :id="item.id"
          :name="item.name"
          :perimeter="item.perimeter"
          :is-completed="item.isCompleted"
          :printer-props="props"
          :is-printing="isPrinting"
        />
      </ul>
      <button :class="{ disabled: isPrinting }" @click="queueHandle">Add to queue</button>
      <p>Print Speed: {{ speed }}mm/s</p>
      <p>Print status: {{ isPrinting ? `printing... ` + progress + '%' : 'offline' }}</p>
      <ProgressBar :progress="progress" />
      <button :class="{ disabled: isPrinting }" :disabled="isPrinting" @click="print">Print</button>
    </div>
  </li>
  <DialogWindow :isOpen="isRefillMode" @close="refillHandle" :onConfirmAction="refill">
    <template #content>
      <select v-model="selectedCoil" name="coil">
        <option selected disabled hidden value="placeholder">Chose a coil</option>
        <option
          v-for="item in coilsData"
          :key="item.id"
          :value="item"
          :label="item.material + ', ' + item.color + ', ' + item.length + 'm'"
        ></option>
      </select>
    </template>
  </DialogWindow>
  <DialogWindow :isOpen="isQueueMode" @close="queueHandle" :onConfirmAction="addToQueue">
    <template #content>
      <select v-model="selectedFigure" name="coil">
        <option selected disabled hidden value="placeholder">Chose a figure</option>
        <option
          v-for="item in figuresStore.getBlueprints"
          :key="item.id"
          :value="item"
          :label="item.name + ', ' + item.perimeter + 'm'"
        ></option>
      </select>
    </template>
  </DialogWindow>
  <DialogWindow :isOpen="isEditingMode" @close="editHandle" :onConfirmAction="editPrinter">
    <template #content>
      <h2>Edit a {{ name }}</h2>
      <div class="input-box">
        <label for="fields.">Enter name</label>
        <input
          class="w-full"
          required
          placeholder=""
          maxlength="10"
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
