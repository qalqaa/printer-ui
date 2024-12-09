<script setup lang="ts">
defineProps<{
  title: string
  loading: boolean
  createHandle?: () => void
}>()
</script>
<template>
  <main class="flex flex-column align-items-center justify-content-center p-5">
    <div class="flex gap-2 align-items-center">
      <h1>{{ title }}</h1>
      <button @click="createHandle">+</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <slot name="list"></slot>
    </div>
    <slot name="dialog"></slot>
  </main>
</template>
