<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { coilsService, figuresService, printersService } from './data/api/api'
import { CustomError } from './model/error/customError'
import type { ICoil, IFigure, IPrinter } from './model/interfaces'
import { useCoilsStore } from './stores/coilsStore'
import { useFiguresStore } from './stores/figuresStore'
import { usePrintersStore } from './stores/printersStore'

const printersStore = usePrintersStore()
const coilsStore = useCoilsStore()
const figuresStore = useFiguresStore()

const printersData = ref<IPrinter[]>([])
const coilsData = ref<ICoil[]>([])
const figuresData = ref<IFigure[]>([])

const getPrintersData = async () => {
  try {
    const data = await printersService.getData()
    printersData.value = data
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(error.message)
    }
  }
}

const getCoilsData = async () => {
  try {
    const data = await coilsService.getData()
    coilsData.value = data
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(error.message)
    }
  }
}

const getFiguresData = async () => {
  try {
    const data = await figuresService.getData()
    figuresData.value = data
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(error.message)
    }
  }
}

const render = async () => {
  try {
    await Promise.all([getPrintersData(), getCoilsData(), getFiguresData()]).then(() => {
      printersStore.addArrayPrinters(printersData.value)
      coilsStore.addArrayCoils(coilsData.value)
      figuresStore.addArrayFigures(figuresData.value)
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(error.message)
    }
  }
}

onMounted(() => {
  render()
})

const router = useRouter()
</script>

<template>
  <header>
    <nav class="flex gap-2 justify-content-between px-7 py-3 bg-color-soft shadow-5">
      <RouterLink to="/" class="flex flex-column align-items-center logo">
        <img class="w-5" src="/favicon.ico" alt="Logo" />
        <p class="c-accent font-bold">qalqaPrint</p>
      </RouterLink>
      <div class="flex align-items-center gap-2">
        <button @click="router.push('/')">Printers</button>
        <button @click="router.push('/coils')">Coils</button>
        <button @click="router.push('/figure-library')">Figure Library</button>
        <button @click="router.push('/done-figures')">Done Figures</button>
      </div>
    </nav>
  </header>
  <RouterView />
  <footer
    class="fixed bottom-0 p-2 w-full flex justify-content-center align-items-center bg-color-soft"
  >
    <p>© qalqa - Бастун Андрей Артемович 231-323</p>
  </footer>
</template>

<style>
.logo {
  filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.25));
}
</style>
