<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import { generateIDs } from '@/util/generateIDs'
import { figuresKey } from '@/util/injectionKeys'
import { computed, inject, onMounted, ref, watch } from 'vue'
import DefaultView from './DefaultView.vue'

const figures = inject(figuresKey)

if (!figures) {
  throw new Error('Figures service is not provided')
}

const { figuresData, getFiguresData } = figures

const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const figureName = ref('')
const figurePerimeter = ref<number>()

const errors = ref({
  figureName: false,
  figurePerimeter: false,
})

const validateFields = () => {
  errors.value.figureName = figureName.value === ''
  errors.value.figurePerimeter = figurePerimeter.value <= 0 || figurePerimeter.value === undefined

  return !errors.value.figureName && !errors.value.figurePerimeter
}

watch(figureName, (newValue) => {
  if (newValue !== '') errors.value.figureName = false
})
watch(figurePerimeter, (newValue) => {
  if (newValue > 0 && newValue !== undefined) errors.value.figurePerimeter = false
})

const createFigure = async () => {
  console.log(figurePerimeter.value)
  if (validateFields()) {
    if (figurePerimeter.value < 0) {
      throw new CustomError("Perimeter can't be negative or null")
    }
    figuresService
      .postData({
        id: generateIDs(),
        isCompleted: false,
        name: figureName.value,
        perimeter: figurePerimeter.value,
        imgUrl: 'figure.png',
      })
      .then(() => {
        getFiguresData()
      })
    toastInstance.addToast('Coil created', 'success')
  } else {
    isCreatingModeTrue.value = false
    throw new CustomError('Fill all required fields')
  }
}

onMounted(() => {
  getFiguresData()
  if (figuresData.value.length === 0) {
    loading.value = false
  }
})

const incompleteFigures = computed(() => {
  return figuresData.value.filter((figure) => !figure.isCompleted)
})

watch(figuresData, () => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Figures" :loading="loading" :create-handle="creatingModeHandle">
    <template #list>
      <FigureList v-if="incompleteFigures.length !== 0" :items="incompleteFigures" />
      <p v-else>No figures found</p>
    </template>
    <template #dialog>
      <DialogWindow
        :isOpen="isCreatingModeTrue"
        @close="creatingModeHandle"
        @confirmAction="createFigure"
      >
        <template #content>
          <h2>Create a new figure</h2>
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
  </DefaultView>
</template>
