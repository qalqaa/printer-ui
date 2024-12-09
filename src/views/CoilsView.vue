<script setup lang="ts">
import CoilList from '@/components/Coil/list/CoilList.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { coilsService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import { generateIDs } from '@/util/generateIDs'
import { coilsKey } from '@/util/injectionKeys'
import { inject, onMounted, ref, watch } from 'vue'
import DefaultView from './DefaultView.vue'

const coils = inject(coilsKey)

if (!coils) {
  throw new Error('Coils service is not provided')
}

const { coilsData, getCoilsData } = coils

const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const coilMaterial = ref('')
const coilColor = ref('')
const coilLength = ref(0)
const createCoil = async () => {
  if (coilMaterial.value !== '' && coilColor.value !== '' && coilLength.value !== 0) {
    coilsService
      .postData({
        id: generateIDs(),
        material: coilMaterial.value,
        color: coilColor.value,
        length: coilLength.value,
        imgUrl: 'coil.png',
      })
      .then(() => {
        getCoilsData()
      })
    toastInstance.addToast('Coil created', 'success')
  } else {
    isCreatingModeTrue.value = false
    throw new CustomError('Fill all required fields')
  }
}

onMounted(() => {
  getCoilsData()
  if (coilsData.value.length === 0) {
    loading.value = false
  }
})

watch(coilsData, () => {
  loading.value = false
})
</script>
<template>
  <DefaultView title="Coils" :loading :create-handle="creatingModeHandle">
    <template #list>
      <CoilList v-if="coilsData.length !== 0" :items="coilsData" />
      <p v-else>No figures found</p>
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
