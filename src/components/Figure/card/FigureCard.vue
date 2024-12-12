<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { useColors } from '@/composables/useColors'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { figuresService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { IColor, IFigure, IPrinter } from '@/model/interfaces'
import { useFiguresStore } from '@/stores/figuresStore'
import { usePrintersStore } from '@/stores/printersStore'
import { ref } from 'vue'

const props = defineProps<IFigure & { printerProps?: IPrinter } & { isPrinting?: boolean }>()

// const figure = inject(figuresKey)
// const printers = inject(printersKey)

// if (!figure || !printers) {
//   throw new Error('Service is not provided')
// }
// const { getFiguresData } = figure
// const { getPrintersData } = printers

const figureStore = useFiguresStore()
const printersStore = usePrintersStore()

const colors = ref<IColor | undefined>({ color: 'red', rotate: 0 })
if (props.color) {
  colors.value = useColors(props.color)
}

const isEditMode = ref(false)
const editModeHandle = () => (isEditMode.value = !isEditMode.value)

const { fields, errors, validateFields } = useFieldValidation(
  {
    figureName: props.name,
    figurePerimeter: props.perimeter,
  },
  {
    figureName: (value) => value !== '',
    figurePerimeter: (value) => value !== undefined && value > 0,
  },
)

const editFigure = () => {
  if (fields.figurePerimeter.value <= 0) {
    errors.figurePerimeter.value = true
    throw new CustomError("Perimeter can't be negative or null")
  }
  if (props.printerProps) {
    if (props.printerProps.queue) {
      const printerWithEditedFigure = {
        ...props.printerProps,
        queue: [
          ...props.printerProps.queue.map((item) => {
            if (item.id === props.id) {
              return {
                ...item,
                name: fields.figureName.value,
                perimeter: fields.figurePerimeter.value,
              }
            }
            return item
          }),
        ],
      }
      printersStore.updatePrinter(printerWithEditedFigure)
      printersService.updateData(props.printerProps.id, printerWithEditedFigure)
      toastInstance.addToast(`${props.name} edited!`, 'success')
    }
    return
  }
  if (validateFields()) {
    const updatedFigure: IFigure = {
      ...props,
      name: fields.figureName.value,
      perimeter: fields.figurePerimeter.value,
    }
    figureStore.updateFigure(updatedFigure)
    figuresService.updateData(props.id, updatedFigure)
    toastInstance.addToast(`${props.name} edited!`, 'success')
  } else {
    throw new CustomError('Fill all required fields')
  }
}

const deleteFigure = () => {
  toastInstance.addToast(`${props.name} deleted!`, 'warning')
  if (props.printerProps) {
    if (props.printerProps.queue) {
      const printerWithoutFigure: IPrinter = {
        ...props.printerProps,
        queue: props.printerProps.queue.filter((item) => item.id !== props.id),
      }
      printersStore.updatePrinter(printerWithoutFigure)
      printersService.updateData(props.printerProps.id, printerWithoutFigure)
    }
    return
  }
  figureStore.deleteFigure(props.id)
  figuresService.deleteData(props.id)
}
</script>

<template>
  <li
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <!-- :style="{ border: '1px solid ' + color }" -->
    <div class="flex flex-column gap-1">
      <h2>{{ name }}</h2>
      <p>Perimeter: {{ perimeter }}m</p>
      <div :class="{ disabled: isPrinting }" v-if="!isCompleted" class="flex flex-row gap-2">
        <button class="pt-2" @click="editModeHandle">
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
        <button class="pt-2" @click="deleteFigure">
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
        </button>
      </div>
    </div>

    <img
      width="150px"
      :src="imgUrl ? imgUrl : 'figure.png'"
      alt="figure-image"
      :style="{ filter: 'hue-rotate(' + colors?.rotate + 'deg' }"
    />
  </li>
  <DialogWindow :isOpen="isEditMode" @close="editModeHandle" @confirmAction="editFigure">
    <template #content>
      <h2>Edit a {{ name }}</h2>
      <div class="input-box">
        <label for="printerName">Enter name</label>
        <input
          class="w-full"
          required
          placeholder=""
          v-model="fields.figureName.value"
          :class="{ 'user-invalid': errors.figureName.value }"
          id="printerName"
          type="text"
        />
      </div>
      <div class="input-box">
        <label for="printerName">Enter perimeter</label>
        <input
          class="w-full"
          required
          placeholder=""
          min="0"
          v-model="fields.figurePerimeter.value"
          :class="{ 'user-invalid': errors.figurePerimeter.value }"
          id="printerBrand"
          type="number"
        />
      </div>
    </template>
  </DialogWindow>
</template>
<style>
.blur {
  backdrop-filter: blur(10px);
}

ul {
  padding: 0;
  list-style-type: none;
}
</style>
