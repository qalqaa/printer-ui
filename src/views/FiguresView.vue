<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useIds } from '@/composables/useIds'
import { useModeSwitcher } from '@/composables/useModeSwitcher'
import { figuresService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { IFigure } from '@/model/interfaces'
import { useFiguresStore } from '@/stores/figuresStore'
import { computed, onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const figuresStore = useFiguresStore()
const figuresData = computed(() => {
  return figuresStore.getBlueprints
})

const loading = ref(true)
const { isModeActive, toggleMode } = useModeSwitcher()

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
    toggleMode('create')
    errors.figurePerimeter.value = true
    throw new CustomError("Perimeter can't be negative or null")
  }
  if (validateFields()) {
    const createdFigure: IFigure = {
      id: useIds(),
      isCompleted: false,
      name: fields.figureName.value,
      perimeter: fields.figurePerimeter.value,
      imgUrl: 'figure.png',
    }
    figuresStore.addFigure(createdFigure)
    figuresService.postData(createdFigure)
    toastInstance.addToast(fields.figureName.value + ' created!', 'success')
  } else {
    toggleMode('create')
    throw new CustomError('Fill all required fields')
  }
}

onMounted(() => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Figures" :loading="loading" :create-handle="() => toggleMode('create')">
    <template #list>
      <FigureList
        id="FigureList"
        v-if="figuresData.length !== 0"
        :items="figuresStore.getBlueprints"
      />
      <p v-else>No figures found 😫</p>
    </template>
    <template #dialog>
      <DialogWindow
        :isOpen="isModeActive('create')"
        @close="toggleMode('create')"
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
