<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import FigureList from '@/components/Figure/list/FigureList.vue'
import { figuresService } from '@/data/api/api'
import { generateIDs } from '@/util/generateIDs'
import { figuresKey } from '@/util/injectionKeys'
import { inject, onMounted, ref, watch } from 'vue'
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
const createPrinter = async () => {
  if (figureName.value !== '' && figurePerimeter.value !== undefined) {
    if (figurePerimeter.value < 0) {
      console.error('Perimeter cannot be negative or null')
      return
    }
    figuresService.postData({
      id: generateIDs(),
      name: figureName.value,
      perimeter: figurePerimeter.value,
      imgUrl: 'figure.png',
    })
  } else {
    console.error('printer name or brand is empty')
  }
  render()
}

const render = async () => {
  getFiguresData()
}

onMounted(() => {
  // render()
})

if (figuresData.value.length !== 0) {
  loading.value = false
}

watch(figuresData, () => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Figures" :loading="loading" :create-handle="creatingModeHandle">
    <template #list>
      <FigureList v-if="figuresData.length !== 0" :items="figuresData" />
      <p v-else>No figures found</p>
    </template>
    <template #dialog>
      <DialogWindow
        :isOpen="isCreatingModeTrue"
        @close="creatingModeHandle"
        @confirmAction="createPrinter"
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
              id="printerBrand"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
