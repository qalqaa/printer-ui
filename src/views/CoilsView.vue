<script setup lang="ts">
import CoilList from '@/components/Coil/list/CoilList.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { coilsService } from '@/data/api/api'
import { colorsLib } from '@/data/static'
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
const coilColor = ref(colorsLib[0].color)
const coilLength = ref<number>()

const errors = ref({
  coilMaterial: false,
  coilColor: false,
  coilLength: false,
})

const validateFields = () => {
  errors.value.coilMaterial = coilMaterial.value === ''
  errors.value.coilColor = coilColor.value === ''
  errors.value.coilLength = coilLength.value === undefined || coilLength.value <= 0

  return !errors.value.coilMaterial && !errors.value.coilColor && !errors.value.coilLength
}

watch(coilMaterial, (newValue) => {
  if (newValue !== '') errors.value.coilMaterial = false
})
watch(coilColor, (newValue) => {
  if (newValue !== '') errors.value.coilColor = false
})
watch(coilLength, (newValue) => {
  if (newValue !== undefined && newValue > 0) errors.value.coilLength = false
})

const createCoil = async () => {
  if (validateFields() && coilLength.value !== undefined) {
    coilsService
      .postData({
        id: generateIDs(),
        material: coilMaterial.value,
        color: coilColor.value,
        length: coilLength.value,
        imgUrl: 'coil.webp',
      })
      .then(() => {
        getCoilsData()
      })
    toastInstance.addToast('Coil created!', 'success')
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
      <p v-else>No coils found 😢</p>
    </template>
    <template #dialog>
      <DialogWindow
        :isOpen="isCreatingModeTrue"
        @close="creatingModeHandle"
        @confirmAction="createCoil"
      >
        <template #content>
          <h2>Create a new coil</h2>
          <div class="input-box">
            <label for="material">Enter material</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="coilMaterial"
              :class="{ 'user-invalid': errors.coilMaterial }"
              id="material"
              type="text"
            />
          </div>
          <div class="input-box">
            <label for="color">Choose color</label>
            <select class="w-full" v-model="coilColor" name="color" id="color">
              <option v-for="color in colorsLib" :key="color.color" :value="color.color">
                {{ color.color }}
              </option>
            </select>
          </div>
          <div class="input-box">
            <label for="length">Enter length</label>
            <input
              class="w-full"
              required
              placeholder=""
              v-model="coilLength"
              :class="{ 'user-invalid': errors.coilLength }"
              id="length"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
