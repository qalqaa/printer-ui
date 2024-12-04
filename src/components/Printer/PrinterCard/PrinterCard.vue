<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { fetchRequest } from '@/data/api/api'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { ref } from 'vue'
import PlasticCoil from '../../PlasticCoil/card/CoilCard.vue'

const props = defineProps<IPrinter>()

const isPrinting = ref(false)

const isRefillMode = ref(false)
const coilData = ref<ICoil[]>([])
const selectedCoil = ref<ICoil>()

const refillHandle = () => {
  fetchRequest<ICoil[]>({ url: '/plasticCoils', method: 'GET' }).then(
    (response) => (coilData.value = response),
  )
  if (coilData.value.length === 0) {
    console.log('no coils')
    return
  }
  isRefillMode.value = !isRefillMode.value
}

const refill = () => {
  if (selectedCoil.value === undefined) return
  fetchRequest<ICoil>({
    url: `/printers/${props.id}`,
    method: 'PUT',
    data: {
      ...props,
      coil: selectedCoil.value,
    },
  })
  fetchRequest<ICoil>({ url: `/plasticCoils/${selectedCoil.value.id}`, method: 'DELETE' })
}
</script>

<template>
  <li class="flex flex-column shadow-5 p-4 border-round-lg bg-color-soft gap-2">
    <img class="w-7 mx-auto" :src="imgUrl" alt="printer_image" />
    <h2>{{ name }} from {{ brand }}</h2>
    <p>Print status: {{ isPrinting ? 'printing...' : 'offline' }}</p>
    <div class="flex" v-if="!coil">
      <button @click="refillHandle" class="inverted w-full">Add coil</button>
    </div>
    <div v-else class="bg-red flex flex-column px-2 py-3 border-round-lg">
      <h3 class="c-accent">Coil</h3>
      <PlasticCoil
        :printer-props="props"
        :id="coil.id"
        :material="coil.material"
        :color="coil.color"
        :length="coil.length"
      />
    </div>

    <p v-if="queue?.length">Queue: {{ queue?.map((item) => item.name).join(', ') }}</p>
    <button v-else>Add to queue</button>
    <button @click="isPrinting = !isPrinting">Print</button>
  </li>
  <DialogWindow :isOpen="isRefillMode" @close="refillHandle" @confirm-action="refill">
    <template #content>
      <select v-model="selectedCoil" name="coil" id="">
        <option selected hidden disable>Select coil</option>
        <option
          v-for="item in coilData"
          :key="item.id"
          :value="item"
          :label="item.material + ', ' + item.color + ', ' + item.length + 'm'"
        ></option>
      </select>
    </template>
  </DialogWindow>
</template>

<style></style>
