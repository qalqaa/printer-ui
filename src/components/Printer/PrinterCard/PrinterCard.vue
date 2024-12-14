<script setup lang="ts">
import CoilCard from '@/components/Coil/card/CoilCard.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureCard from '@/components/Figure/card/FigureCard.vue'
import ArrowSvg from '@/components/Svg/ArrowSvg.vue'
import PenSvg from '@/components/Svg/PenSvg.vue'
import TrashSvg from '@/components/Svg/TrashSvg.vue'
import { useErrorHandling } from '@/composables/useErrorHandling'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useModeSwitcher } from '@/composables/useModeSwitcher'
import { useSimulateErrors } from '@/composables/useSimulateErrors'
import { coilsService, figuresService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { IPrinter } from '@/model/interfaces'
import type { IPrinterCardState } from '@/model/states/printerCard'
import { useCoilsStore } from '@/stores/coilsStore'
import { useFiguresStore } from '@/stores/figuresStore'
import { usePrintersStore } from '@/stores/printersStore'
import { reactive } from 'vue'
import ProgressBar from '../ProgressBar/ProgressBar.vue'

const props = defineProps<IPrinter>()

const printersStore = usePrintersStore()
const coilsStore = useCoilsStore()
const figuresStore = useFiguresStore()

const state = reactive<IPrinterCardState>({
  isPrinting: false,
  progress: 0,
  isQueueCollapsed: true,
  isCoilCollapsed: true,
  selectedCoil: 'placeholder',
  selectedFigure: 'placeholder',
})

const coilsData = coilsStore.getCoils

const { toggleMode, isModeActive } = useModeSwitcher()
const modes = ['refill', 'queue', 'edit']
const { throwIf, throwCustomError } = useErrorHandling()

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

const refillHandle = () => {
  throwIf(coilsData.length === 0, 'No coils, create at least one in coils tab')
  toggleMode(modes[0])
}

const queueHandle = () => {
  throwIf(
    figuresStore.getBlueprints.length === 0 && !isModeActive(modes[1]),
    'No figures, create at least one in figures tab',
  )
  toggleMode(modes[1])
}

const editHandle = () => {
  toggleMode(modes[2])
}

const refill = () => {
  throwIf(state.isPrinting, 'Cannot remove coil while printing')
  throwIf(props.coil !== null, 'Coil is already installed')
  if (state.selectedCoil !== 'placeholder') {
    printersStore.addCoil(props.id, state.selectedCoil)
    coilsStore.deleteCoil(state.selectedCoil.id)
    printersService.updateData(props.id, { ...props, coil: state.selectedCoil })
    coilsService.deleteData(state.selectedCoil.id)
    toastInstance.addToast('Coil refilled!', 'success')
    return
  }
  throwCustomError('Choose a coil!')
}

const addToQueue = () => {
  if (state.selectedFigure !== 'placeholder') {
    if (!props.queue) {
      printersService.updateData(props.id, { ...props, queue: [state.selectedFigure] })
    } else {
      printersService.updateData(props.id, {
        ...props,
        queue: [...props.queue, state.selectedFigure],
      })
    }
    printersStore.addToQueue(props.id, state.selectedFigure)

    toastInstance.addToast(`${state.selectedFigure.name} added to queue!`, 'success')
    figuresStore.deleteFigure(state.selectedFigure.id)
    figuresService.deleteData(state.selectedFigure.id)
    state.selectedFigure = 'placeholder'
    return
  }
  throwCustomError('Choose a figure!')
}

const editPrinter = () => {
  if (fields.printerSpeed.value <= 0) {
    errors.printerSpeed.value = true
    throwCustomError("Speed can't be negative or null")
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
    throwCustomError('Invalid fields')
  }
}

const print = (): void => {
  if (!props.queue || props.queue.length === 0) {
    throw new CustomError('No figures in queue')
  }

  if (!props.coil) {
    throw new CustomError('No coil inside printer, first refill it')
  }

  state.isPrinting = true
  const currentFigure = props.queue[0]
  const perimeterPrintedFigure = currentFigure.perimeter
  const onePercentTime = (perimeterPrintedFigure * 10000) / props.speed
  const filamentPerTick = Math.round((perimeterPrintedFigure / 100) * 1000)

  if (!props.coil || props.coil.length < perimeterPrintedFigure) {
    state.isPrinting = false
    throw new CustomError('Coil is too short')
  }

  const timer = setInterval(() => {
    const error = useSimulateErrors(state.progress)

    if (error) {
      clearInterval(timer)
      state.isPrinting = false

      switch (error.type) {
        case 'thread':
          toastInstance.addToast(error.message, 'error')
          return

        case 'nozzle':
          state.progress = 0
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

    if (state.progress < 100 && props.coil) {
      state.progress++
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
          state.isPrinting = false

          if (props.queue!.length > 0) {
            state.progress = 0
            print()
          }
          state.progress = 0
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
    class="flex flex-column shadow-5 p-4 border-round-lg bg-color-soft gap-2 relative justify-content-between"
  >
    <button
      :class="{ disabled: state.isPrinting }"
      @click="deletePrinter"
      class="absolute pt-2 top-0 right-0 m-2"
    >
      <TrashSvg />
    </button>
    <button
      :class="{ disabled: state.isPrinting }"
      @click="editHandle"
      class="absolute pt-2 top-0 right-0 m-2 mr-6"
    >
      <PenSvg />
    </button>
    <div class="flex flex-column gap-2">
      <img class="w-7 mx-auto" :src="imgUrl" alt="printer_image" />
      <h2>{{ name }} from {{ brand }}</h2>
      <div class="flex flex-column">
        <div class="flex" v-if="coil">
          <div class="flex collapse-hitbox" @click="state.isCoilCollapsed = !state.isCoilCollapsed">
            <h2>Coil</h2>
            <ArrowSvg :is-collapsed="state.isCoilCollapsed" />
          </div>
          <span class="pt-2" v-if="state.isCoilCollapsed">({{ coil.length }}m)</span>
        </div>
        <button v-else @click="refillHandle" class="w-full">Add coil</button>
        <ul v-if="!state.isCoilCollapsed && coil" class="flex flex-column py-3 border-round-lg">
          <CoilCard
            :printer-props="props"
            :id="coil.id"
            :material="coil.material"
            :color="coil.color"
            :length="coil.length"
            :is-printing="state.isPrinting"
          />
        </ul>
      </div>
      <div class="flex flex-column" v-if="queue?.length">
        <div class="flex">
          <div
            class="flex collapse-hitbox"
            @click="state.isQueueCollapsed = !state.isQueueCollapsed"
          >
            <h2>Queue</h2>
            <ArrowSvg :is-collapsed="state.isQueueCollapsed" />
          </div>
          <span class="pt-2" v-if="state.isQueueCollapsed">({{ queue.length }})</span>
        </div>
        <p v-if="state.isQueueCollapsed">{{ queue.map((item) => item.name).join(', ') }}</p>
        <ul v-else class="flex flex-column py-3 border-round-lg gap-2">
          <FigureCard
            v-for="item in props.queue"
            :key="item.id"
            :id="item.id"
            :name="item.name"
            :perimeter="item.perimeter"
            :is-completed="item.isCompleted"
            :printer-props="props"
            :is-printing="state.isPrinting"
          />
        </ul>
      </div>
      <button class="w-full" :class="{ disabled: state.isPrinting }" @click="queueHandle">
        Add to queue
      </button>
    </div>
    <div class="flex flex-column">
      <h2>Info</h2>
      <p>Print Speed: {{ speed }}mm/s</p>
      <p :class="{ 'c-accent': state.isPrinting }" id="print-status">
        Print status: {{ state.isPrinting ? `printing... ` + state.progress + '%' : 'offline' }}
      </p>

      <ProgressBar :progress="state.progress" class="mb-1" />
      <button
        :class="{ disabled: state.isPrinting }"
        class="inverted w-full"
        :disabled="state.isPrinting"
        @click="print"
      >
        Print
      </button>
    </div>
  </li>
  <DialogWindow :isOpen="isModeActive(modes[0])" @close="refillHandle" :onConfirmAction="refill">
    <template #content>
      <select v-model="state.selectedCoil" name="coil">
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
  <DialogWindow :isOpen="isModeActive(modes[1])" @close="queueHandle" :onConfirmAction="addToQueue">
    <template #content>
      <select v-model="state.selectedFigure" name="coil">
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
  <DialogWindow :isOpen="isModeActive(modes[2])" @close="editHandle" :onConfirmAction="editPrinter">
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

<style scoped>
.collapse-hitbox {
  cursor: pointer;
}

.rotate {
  transform: rotate(-90deg);
}

.rotate-btn {
  transition: transform 0.3s ease-in-out;
  padding: 10px;
}
</style>
