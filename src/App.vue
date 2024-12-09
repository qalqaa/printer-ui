<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { CustomError } from './model/error/customError'
import { coilsService, figuresService, printersService } from './data/api/api'
import type { ICoil, IFigure, IPrinter } from './model/interfaces'
import { coilsKey, figuresKey, printersKey } from './util/injectionKeys'

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
    await Promise.all([getPrintersData(), getCoilsData(), getFiguresData()])
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(error.message)
    }
  }
}

onMounted(() => {
  render()
})

provide(printersKey, {
  printersData,
  getPrintersData,
})
provide(coilsKey, {
  coilsData,
  getCoilsData,
})
provide(figuresKey, {
  figuresData,
  getFiguresData,
})

const router = useRouter()
</script>

<template>
  <header>
    <nav class="flex gap-2 justify-content-between px-7 py-3 bg-color-soft shadow-5">
      <RouterLink to="/" class="flex flex-column align-items-center">
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
  <div></div>
  <RouterView />
</template>

<style></style>
