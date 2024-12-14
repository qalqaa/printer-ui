<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PenSvg from '@/components/Svg/PenSvg.vue'
import TrashSvg from '@/components/Svg/TrashSvg.vue'
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

if (!props.name || !props.perimeter || props.isCompleted === undefined) {
  throw new CustomError('Invalid figure props')
}

const figureStore = useFiguresStore()
const printersStore = usePrintersStore()

const isEditMode = ref(false)

const colors = ref<IColor | undefined>({ color: 'red', rotate: 0 })
if (props.color) {
  colors.value = useColors(props.color)
}

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

const editModeHandle = () => (isEditMode.value = !isEditMode.value)

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
    const filteredProps = {
      id: props.id,
      name: props.name,
      perimeter: props.perimeter,
      imgUrl: props.imgUrl,
      isCompleted: props.isCompleted,
    }
    const updatedFigure: IFigure = {
      ...filteredProps,
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
          <PenSvg />
        </button>
        <button class="pt-2" @click="deleteFigure">
          <TrashSvg />
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
