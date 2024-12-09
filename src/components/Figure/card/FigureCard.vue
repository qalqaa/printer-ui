<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { IFigure } from '@/model/interfaces'
import { figuresKey } from '@/util/injectionKeys'
import { inject, ref, watch } from 'vue'

const figure = inject(figuresKey)

if (!figure) {
  throw new Error('Service is not provided')
}
const props = defineProps<IFigure>()

const { getFiguresData } = figure

const figureName = ref(props.name)
const figurePerimeter = ref(props.perimeter)

const isEditMode = ref(false)
const editModeHandle = () => (isEditMode.value = !isEditMode.value)

const errors = ref({
  figureName: false,
  figurePerimeter: false,
})

const validateFields = () => {
  errors.value.figureName = figureName.value === ''
  errors.value.figurePerimeter = figurePerimeter.value === undefined || figurePerimeter.value <= 0
  return !errors.value.figureName && !errors.value.figurePerimeter
}

watch(figureName, (newValue) => {
  if (newValue !== '') errors.value.figureName = false
})
watch(figurePerimeter, (newValue) => {
  if (newValue !== undefined && newValue > 0) errors.value.figurePerimeter = false
})

const editFigure = () => {
  if (validateFields()) {
    figuresService
      .updateData(props.id, {
        ...props,
        name: figureName.value,
        perimeter: figurePerimeter.value,
      })
      .then(() => {
        getFiguresData()
      })
    toastInstance.addToast(`${props.name} edited!`, 'success')
  } else {
    throw new CustomError('Fill all required fields')
  }
}

const deleteFigure = () => {
  toastInstance.addToast(`${props.name} deleted!`, 'warning')
  figuresService.deleteData(props.id).then(() => {
    getFiguresData()
  })
}
</script>

<template>
  <div
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <div class="flex flex-column gap-1">
      <h2>{{ name }}</h2>
      <p>Perimeter: {{ perimeter }}m</p>
      <div v-if="!isCompleted" class="flex flex-row gap-2">
        <button @click="editModeHandle">
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
        <button @click="deleteFigure">
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

    <img width="100px" :src="imgUrl ? imgUrl : 'figure.png'" alt="figure-image" />
  </div>
  <DialogWindow :isOpen="isEditMode" @close="editModeHandle" @confirmAction="editFigure">
    <template #content>
      <h2>Edit a {{ name }}</h2>
      <div class="input-box">
        <label for="printerName">Enter name</label>
        <input
          class="w-full"
          required
          placeholder=""
          v-model="figureName"
          :class="{ 'user-invalid': errors.figureName }"
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
          v-model="figurePerimeter"
          :class="{ 'user-invalid': errors.figurePerimeter }"
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
</style>
