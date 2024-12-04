<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import CoilList from '@/components/PlasticCoil/list/CoilList.vue'
import { fetchRequest } from '@/data/api/api'
import type { ICoil } from '@/model/interfaces'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const coilData = ref<ICoil[]>([])
const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const coilMaterial = ref('')
const coilColor = ref('')
const coilLength = ref(0)
const createCoil = async () => {
  if (coilMaterial.value !== '' && coilColor.value !== '' && coilLength.value !== 0) {
    await fetchRequest<ICoil>({
      url: '/plasticCoils',
      method: 'POST',
      data: {
        material: coilMaterial.value,
        color: coilColor.value,
        length: coilLength.value,
      },
    })
  }
  render()
}

const render = async () => {
  fetchRequest<ICoil[]>({ url: '/plasticCoils', method: 'GET' })
    .then((response) => (coilData.value = response))
    .finally(() => (loading.value = false))
}

onMounted(() => {
  render()
})
</script>
<template>
  <DefaultView title="Coils" :loading :create-handle="creatingModeHandle">
    <template #list>
      <CoilList :items="coilData" />
    </template>
    <template #dialog>
      <DialogWindow
        :isOpen="isCreatingModeTrue"
        @close="creatingModeHandle"
        @confirmAction="createCoil"
      >
        <template #content>
          <h2>Create a new printer</h2>
          <div class="input-box">
            <label for="material">Enter material</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="coilMaterial"
              id="material"
              type="text"
            />
          </div>
          <div class="input-box">
            <label for="color">Enter color</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="coilColor"
              id="color"
              type="text"
            />
          </div>
          <div class="input-box">
            <label for="length">Enter length</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="coilLength"
              id="length"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
