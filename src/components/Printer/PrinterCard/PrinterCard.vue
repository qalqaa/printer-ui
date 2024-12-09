<script setup lang="ts">
import CoilCard from '@/components/Coil/card/CoilCard.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { coilsService, figuresService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { coilsKey, figuresKey, printersKey } from '@/util/injectionKeys'
import { simulateErrors } from '@/util/simulateErrors'
import { computed, inject, ref } from 'vue'
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
const selectedCoil = ref<ICoil | 'placeholder'>('placeholder')
const selectedFigure = ref<IFigure | 'placeholder'>('placeholder')

const queueHandle = () => {
  if (incompleteFigures.value.length === 0) {
    throw new CustomError('No figures in queue')
  }
  isQueueMode.value = !isQueueMode.value
}

const refillHandle = () => {
  if (coilsData.value.length === 0) {
    throw new CustomError('No coils, create at least one in coils tab')
  }
  isRefillMode.value = !isRefillMode.value
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
</script>

<template>
  <li
    class="flex flex-column shadow-5 p-4 border-round-lg bg-color-soft gap-2 justify-content-between"
  >
    <div class="flex flex-column gap-2">
      <img class="w-7 mx-auto" :src="imgUrl" alt="printer_image" />
      <h2>{{ name }} from {{ brand }}</h2>

      <div class="flex" v-if="!coil">
        <button @click="refillHandle" class="inverted w-full">Add coil</button>
      </div>
      <div v-else class="bg-red flex flex-column px-2 py-3 border-round-lg">
        <h3 class="c-accent">Coil</h3>
        <CoilCard
          :printer-props="props"
          :id="coil.id"
          :material="coil.material"
          :color="coil.color"
          :length="coil.length"
        />
      </div>
    </div>
    <div class="flex flex-column gap-2">
      <p v-if="queue?.length">Queue: {{ queue?.map((item) => item.name).join(', ') }}</p>
      <button @click="queueHandle">Add to queue</button>
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
</template>

<style>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.disabled:hover {
  box-shadow: none;
  text-shadow: none;
}
</style>
