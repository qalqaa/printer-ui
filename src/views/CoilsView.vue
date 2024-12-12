<script setup lang="ts">
import CoilList from '@/components/Coil/list/CoilList.vue'
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useIds } from '@/composables/useIds'
import { coilsService } from '@/data/api/api'
import { colorsLib } from '@/data/static'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil } from '@/model/interfaces'
import { useCoilsStore } from '@/stores/coilsStore'
import { onMounted, ref } from 'vue'
import DefaultView from './DefaultView.vue'

const coilsStore = useCoilsStore()
const coilsData = coilsStore.getCoils

const loading = ref(true)
const isCreatingModeTrue = ref(false)

const creatingModeHandle = () => (isCreatingModeTrue.value = !isCreatingModeTrue.value)

const { fields, errors, validateFields } = useFieldValidation(
  {
    coilMaterial: '',
    coilColor: 'red',
    coilLength: 0,
  },
  {
    coilMaterial: (value) => value !== '',
    coilColor: (value) => value !== '',
    coilLength: (value) => value !== undefined && value > 0,
  },
)

const createCoil = async () => {
  if (fields.coilLength.value <= 0) {
    isCreatingModeTrue.value = false
    errors.coilLength.value = true
    throw new CustomError("Length can't be negative or null")
  }
  if (validateFields()) {
    const createdCoil: ICoil = {
      id: useIds(),
      material: fields.coilMaterial.value,
      color: fields.coilColor.value,
      length: fields.coilLength.value,
      imgUrl: 'coil.webp',
    }
    coilsStore.addCoil(createdCoil)
    coilsService.postData(createdCoil)
    toastInstance.addToast('Coil created!', 'success')
  } else {
    isCreatingModeTrue.value = false
    throw new CustomError('Fill all required fields')
  }
}

onMounted(() => {
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
              v-model="fields.coilMaterial.value"
              :class="{ 'user-invalid': errors.coilMaterial.value }"
              id="material"
              type="text"
            />
          </div>
          <div>
            <label for="color">Choose color</label>
            <select class="w-full" v-model="fields.coilColor.value" name="color" id="color">
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
              v-model="fields.coilLength.value"
              :class="{ 'user-invalid': errors.coilLength.value }"
              id="length"
              type="number"
            />
          </div>
        </template>
      </DialogWindow>
    </template>
  </DefaultView>
</template>
