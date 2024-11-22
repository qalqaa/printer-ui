<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

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

  <RouterView />
</template>

<style></style>
