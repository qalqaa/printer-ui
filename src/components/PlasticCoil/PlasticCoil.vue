<script setup lang="ts">
import type { Meter } from '@/model/types'
import { ref } from 'vue'

const props = defineProps<{ material: string; color: string; length: Meter }>()

const localLength = ref(props.length)

const isCuttingMode = ref(false)
const cutLength = ref(0)

const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const cut = () => {
  if (cutLength.value > localLength.value) {
    localLength.value = 0
    cuttingModeHandle()
    return
  }
  localLength.value -= cutLength.value
  cuttingModeHandle()
}
</script>

<template>
  <p>Material: {{ material }}</p>
  <p>Color: {{ color }}</p>
  <p>Length: {{ localLength }} m</p>
  <button v-if="!isCuttingMode && localLength > 0" @click="cuttingModeHandle()">
    Undercut Coil
  </button>
  <button class="inverted" v-if="localLength === 0">Refill Coil</button>
  <div
    v-if="isCuttingMode"
    class="w-screen h-screen left-0 top-0 absolute blur flex items-center justify-content-center align-items-center"
  >
    <div class="bg-color-soft flex flex-column gap-2 p-4 w-3 pt-5 border-round-lg relative">
      <button class="inverted absolute top-0 right-0" @click="isCuttingMode = false">x</button>
      <p>Length: {{ localLength }}</p>
      <div class="input-box">
        <label for="cutLength">Choose cut length</label>
        <input
          id="cutLength"
          class="w-full"
          placeholder=""
          v-model="cutLength"
          min="0"
          :max="localLength"
          type="number"
        />
      </div>
      <button @click="cut()">Cut</button>
    </div>
  </div>
</template>

<style>
.blur {
  backdrop-filter: blur(10px);
}
</style>
