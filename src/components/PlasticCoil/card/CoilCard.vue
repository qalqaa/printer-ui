<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { fetchRequest } from '@/data/api/api'
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
      fetchRequest<ICoil>({
        url: `/printers/${props.printerProps.id}`,
        method: 'PUT',
        data: {
          ...props.printerProps,
          coil: null,
        },
      })
      return
    }
    fetchRequest<ICoil>({
      url: `/plasticCoils/${props.id}`,
      method: 'DELETE',
    })
    return
  }

  localLength.value -= cutLength.value
  if (props.printerProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printerProps, length, ...filteredProps } = props
    fetchRequest<ICoil>({
      url: `/printers/${props.printerProps.id}`,
      method: 'PUT',
      data: {
        ...props.printerProps,
        coil: { ...filteredProps, length: localLength.value },
      },
    })
    return
  }
  fetchRequest<ICoil>({
    url: `/pasteCoils/${props.id}`,
    method: 'PUT',
    data: {
      ...props,
      length: localLength.value,
    },
  })
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
      <p>Length: {{ localLength }} m</p>
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
