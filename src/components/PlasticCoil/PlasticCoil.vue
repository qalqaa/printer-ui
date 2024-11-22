<script setup lang="ts">
import type { Meter } from '@/model/types'
import { ref } from 'vue'
import DialogWindow from '../DialogWindow/DialogWindow.vue'

const props = defineProps<{ material: string; color: string; length: Meter }>()

const localLength = ref(props.length)

const isCuttingMode = ref(false)
const cutLength = ref(0)

const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const cut = () => {
  if (cutLength.value > localLength.value) {
    localLength.value = 0
  } else {
    localLength.value -= cutLength.value
  }
}
</script>

<template>
  <p>Material: {{ material }}</p>
  <p>Color: {{ color }}</p>
  <p>Length: {{ localLength }} m</p>
  <button v-if="!isCuttingMode && localLength > 0" @click="cuttingModeHandle">Undercut Coil</button>
  <button class="inverted" v-if="localLength === 0">Refill Coil</button>
  <DialogWindow :isOpen="isCuttingMode" @close="cuttingModeHandle" @confirm-action="cut">
    <template #content>
      <p>Length: {{ localLength }} m</p>
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
    </template>
  </DialogWindow>
</template>
<style>
.blur {
  backdrop-filter: blur(10px);
}
</style>
