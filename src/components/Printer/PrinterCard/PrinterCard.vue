<script setup lang="ts">
import CoilCard from '@/components/Coil/card/CoilCard.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { fetchRequest } from '@/data/api/api'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { coilsKey } from '@/util/injectionKeys'
import { inject, ref } from 'vue'

const props = defineProps<IPrinter>()

const isPrinting = ref(false)

const coils = inject(coilsKey)

if (!coils) {
  throw new Error('Printers service is not provided')
}

const { coilsData } = coils

const isRefillMode = ref(false)
const selectedCoil = ref<ICoil | 'placeholder'>('placeholder')

const refillHandle = () => {
  if (coilsData.value.length === 0) {
    console.log('no coils')
    return
  }
  isRefillMode.value = !isRefillMode.value
}

const refill = () => {
  if (selectedCoil.value !== 'placeholder') {
    fetchRequest<ICoil>({
      url: `/printers/${props.id}`,
      method: 'PUT',
      data: {
        ...props,
        coil: selectedCoil.value,
      },
    })
    fetchRequest<ICoil>({ url: `/coils/${selectedCoil.value.id}`, method: 'DELETE' })
    return
  }
  console.error('choose a coil')
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
      <CoilCard
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
  <DialogWindow :isOpen="isRefillMode" @close="refillHandle" :onConfirmAction="refill">
    <template #content>
      <select v-model="selectedCoil" name="coil">
        <option selected disabled hidden value="placeholder">Chose a coil</option>
        <option
          v-for="item in coilsData"
          :key="item.id"
          :value="item"
          :label="item.material + ', ' + item.color + ', ' + item.length + 'm'"
        ></option>
      </select>
    </template>
  </DialogWindow>
</template>

<style></style>
