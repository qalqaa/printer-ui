<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useIds } from '@/composables/useIds'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
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

const { fields, errors, validateFields } = useFieldValidation(
  {
    figureName: '',
    figurePerimeter: 0,
  },
  {
    figureName: (value) => value !== '',
    figurePerimeter: (value) => value !== undefined && value > 0,
  },
)

const createFigure = async () => {
  if (fields.figurePerimeter.value <= 0) {
    isCreatingModeTrue.value = false
    errors.figurePerimeter.value = true
    throw new CustomError("Perimeter can't be negative or null")
  }
  if (validateFields()) {
    figuresService
      .postData({
        id: useIds(),
        isCompleted: false,
        name: fields.figureName.value,
        perimeter: fields.figurePerimeter.value,
        imgUrl: 'figure.png',
      })
      .then(() => {
        getFiguresData()
      })
    toastInstance.addToast(fields.figureName.value + ' created!', 'success')
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
      <FigureList
        id="FigureList"
        v-if="incompleteFigures.length !== 0"
        :items="incompleteFigures"
      />
      <p v-else>No figures found 😫</p>
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
  </DefaultView>
</template>
