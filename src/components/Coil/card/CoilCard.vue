<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { coilsService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { ref } from 'vue'

const props = defineProps<ICoil & { printerProps?: IPrinter }>()

const localLength = ref(props.length)

const isCuttingMode = ref(false)
const cutLength = ref(0)

const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const cut = () => {
  if (cutLength.value >= localLength.value) {
    localLength.value = 0
    if (props.printerProps) {
      printersService.updateData(props.printerProps.id, {
        ...props.printerProps,
        coil: null,
      })
      toastInstance.addToast(`Coil is cutted`, 'success')
      return
    }
    coilsService.deleteData(props.id)
    return
  }

  localLength.value -= cutLength.value
  if (props.printerProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printerProps, length, ...filteredProps } = props
    printersService.updateData(props.printerProps.id, {
      ...props.printerProps,
      coil: { ...filteredProps, length: localLength.value },
    })
    toastInstance.addToast(`Coil is cutted`, 'success')
    return
  }
  coilsService.updateData(props.id, { ...props, length: localLength.value })
  toastInstance.addToast(`Coil is cutted`, 'success')
}
</script>

<template>
  <div
    v-if="localLength > 0"
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <div class="flex flex-column gap-1">
      <p>Material: {{ material }}</p>
      <p>Color: {{ color }}</p>
      <p>Length: {{ localLength }}m</p>
      <button @click="cuttingModeHandle">Undercut Coil</button>
    </div>
    <img width="100px" :src="imgUrl ? imgUrl : 'coil.png'" alt="coil-image" />
  </div>
  <DialogWindow :isOpen="isCuttingMode" @close="cuttingModeHandle" @confirm-action="cut()">
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
