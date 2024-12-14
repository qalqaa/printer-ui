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

const isBurgerMenuOpen = ref(false)

const toggleBurgerMenu = () => {
  isBurgerMenuOpen.value = !isBurgerMenuOpen.value
}
</script>

<template>
  <header>
    <nav class="flex gap-2 justify-content-between px-7 py-3 bg-color-soft shadow-5 relative">
      <RouterLink to="/" class="flex flex-column align-items-center logo">
        <img class="w-5" src="/favicon.ico" alt="Logo" />
        <p class="c-accent font-bold">qalqaPrint</p>
      </RouterLink>
      <div
        class="align-items-center gap-2 navigation-bar"
        :class="{ 'navigation-bar--open': isBurgerMenuOpen }"
      >
        <button class="nav-btn" @click="router.push('/')">Printers</button>
        <button class="nav-btn" @click="router.push('/coils')">Coils</button>
        <button class="nav-btn" @click="router.push('/figure-library')">Figure Library</button>
        <button class="nav-btn" @click="router.push('/done-figures')">Done Figures</button>
      </div>
      <button class="burger-menu" @click="toggleBurgerMenu">
        <span :class="{ 'burger-menu__line--open': isBurgerMenuOpen }"></span>
        <span :class="{ 'burger-menu__line--open': isBurgerMenuOpen }"></span>
        <span :class="{ 'burger-menu__line--open': isBurgerMenuOpen }"></span>
      </button>
    </nav>
  </header>
  <RouterView class="router" />
  <footer
    class="fixed bottom-0 p-2 w-full flex justify-content-center align-items-center bg-color-soft"
  >
    <p>© qalqa - Бастун Андрей Артемович 231-323</p>
  </footer>
</template>

<style scoped>
.logo {
  filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.25));
}

.navigation-bar {
  display: flex;
}

.burger-menu {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 20px 20px 0px 20px;
}

.burger-menu > span {
  width: 25px;
  height: 3px;
  background-color: var(--accent);
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}

.burger-menu__line--open:nth-child(1) {
  transform: rotate(45deg) translate(6px, 5px);
}

.burger-menu__line--open:nth-child(2) {
  opacity: 0;
}

.burger-menu__line--open:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -5px);
}

.navigation-bar--open {
  display: flex !important;
  flex-direction: column;
  position: absolute;
  box-sizing: border-box;
  top: 100%;
  right: 0;
  width: 100%;
  padding: 1rem;
  z-index: 999;
  height: 93vh;
  backdrop-filter: blur(5px) brightness(80%);
}

@media (max-width: 768px) {
  footer {
    font-size: 10px;
  }

  header {
    position: fixed;
    width: 100%;
    z-index: 1000;
  }

  nav {
    padding: 10px 5px !important;
  }

  .nav-btn {
    width: 100%;
  }

  .router {
    padding-top: 100px !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
  }

  .navigation-bar {
    display: none;
  }

  .burger-menu {
    display: flex;
  }
}
</style>
