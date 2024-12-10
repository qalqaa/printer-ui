<script lang="ts" setup>
const props = defineProps<{
  progress: number
}>()
</script>

<template>
  <div class="progress-bar w-full">
    <div class="progress-bar__fill h-full" :style="{ width: `${props.progress}%` }"></div>
  </div>
</template>

<style scoped>
.progress-bar {
  height: 5px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar__fill {
  background-color: var(--accent);
  width: 0;
  transition: width 0.3s ease-in-out;
}
</style>
