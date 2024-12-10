<script setup lang="ts">
import CoilCard from '@/components/Coil/card/CoilCard.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureCard from '@/components/Figure/card/FigureCard.vue'
import { coilsService, figuresService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { coilsKey, figuresKey, printersKey } from '@/util/injectionKeys'
import { simulateErrors } from '@/util/simulateErrors'
import { computed, inject, ref, watch } from 'vue'
import ProgressBar from '../ProgressBar/ProgressBar.vue'

const props = defineProps<IPrinter>()

const isPrinting = ref(false)

const printers = inject(printersKey)
const coils = inject(coilsKey)
const figures = inject(figuresKey)

if (!coils || !figures || !printers) {
  throw new Error('Service is not provided')
}
const { getPrintersData } = printers
const { coilsData, getCoilsData } = coils
const { figuresData, getFiguresData } = figures

const incompleteFigures = computed(() => {
  return figuresData.value.filter((figure) => !figure.isCompleted)
})

const isRefillMode = ref(false)
const isQueueMode = ref(false)
const isEditingMode = ref(false)
const selectedCoil = ref<ICoil | 'placeholder'>('placeholder')
const selectedFigure = ref<IFigure | 'placeholder'>('placeholder')

const printerName = ref(props.name)
const printerBrand = ref(props.brand)
const printerSpeed = ref(props.speed)

const errors = ref({
  printerName: false,
  printerBrand: false,
  printerSpeed: false,
})

const validateFields = () => {
  errors.value.printerName = printerName.value === ''
  errors.value.printerBrand = printerBrand.value === ''
  errors.value.printerSpeed = printerSpeed.value <= 0 || printerSpeed.value === undefined

  return !errors.value.printerName && !errors.value.printerBrand && !errors.value.printerSpeed
}

watch(printerName, (newValue) => {
  if (newValue !== '') errors.value.printerName = false
})
watch(printerBrand, (newValue) => {
  if (newValue !== '') errors.value.printerBrand = false
})
watch(printerSpeed, (newValue) => {
  if (newValue > 0 && newValue !== undefined) errors.value.printerSpeed = false
})

const queueHandle = () => {
  if (incompleteFigures.value.length === 0) {
    throw new CustomError('No figures, create at least one in figures tab')
  }
  isQueueMode.value = !isQueueMode.value
}

const refillHandle = () => {
  if (coilsData.value.length === 0) {
    throw new CustomError('No coils, create at least one in coils tab')
  }
  isRefillMode.value = !isRefillMode.value
}

const editHandle = () => {
  isEditingMode.value = !isEditingMode.value
}

const editPrinter = () => {
  if (validateFields()) {
    printersService
      .updateData(props.id, {
        ...props,
        name: printerName.value,
        brand: printerBrand.value,
        speed: printerSpeed.value,
      })
      .then(() => {
        getPrintersData()
      })
    toastInstance.addToast('Printer edited!', 'success')
  } else {
    isEditingMode.value = false
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
    toastInstance.addToast(`${selectedFigure.value.name} added to queue!`, 'success')
    figuresService.deleteData(selectedFigure.value.id).then(() => {
      getPrintersData()
      getFiguresData()
    })

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
    printersService.updateData(props.id, { ...props, coil: selectedCoil.value })
    coilsService.deleteData(selectedCoil.value.id).then(() => {
      getPrintersData()
    })
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

  if (!props.coil || props.coil.length < perimeterPrintedFigure) {
    isPrinting.value = false
    throw new CustomError('Coil is too short')
  }

  const timer = setInterval(() => {
    const error = simulateErrors(progress.value)

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
          printersService
            .updateData(props.id, {
              ...props,
              queue: props.queue.slice(1),
            })
            .then(() => {
              getPrintersData()
            })
          return

        case 'electricity':
          toastInstance.addToast(error.message, 'error')
          return
      }
    }

    if (progress.value < 100) {
      progress.value++
    } else {
      if (!props.coil || !props.queue || props.queue.length === 0) {
        return
      }

      toastInstance.addToast(`${currentFigure.name} is printed!`, 'success')

      figuresService.postData({
        ...currentFigure,
        isCompleted: true,
      })

      printersService
        .updateData(props.id, {
          ...props,
          queue: props.queue.slice(1),
          coil: { ...props.coil, length: props.coil.length - perimeterPrintedFigure },
        })
        .then(() => {
          getPrintersData().then(() => {
            getCoilsData()
            clearInterval(timer)
            isPrinting.value = false

            if (props.queue!.length > 0) {
              progress.value = 0
              print()
            }
            progress.value = 0
          })
        })
    }
  }, onePercentTime)
}

const deletePrinter = () => {
  printersService.deleteData(props.id).then(() => {
    toastInstance.addToast(props.name + ' deleted!', 'warning')
    getPrintersData()
  })
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
          v-for="item in queue"
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
          v-for="item in incompleteFigures"
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
        <label for="printerName">Enter name</label>
        <input
          class="w-full"
          required
          placeholder=""
          maxlength="10"
          v-model="printerName"
          :class="{ 'user-invalid': errors.printerName }"
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
          :class="{ 'user-invalid': errors.printerBrand }"
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
          :class="{ 'user-invalid': errors.printerSpeed }"
          id="printerSpeed"
          type="number"
        />
      </div>
    </template>
  </DialogWindow>
</template>
