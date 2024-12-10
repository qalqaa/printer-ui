<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { coilsService, printersService } from '@/data/api/api'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { coilsKey, printersKey } from '@/util/injectionKeys'
import { inject, ref, watch } from 'vue'

const props = defineProps<ICoil & { printerProps?: IPrinter } & { isPrinting?: boolean }>()

const coilMaterial = ref(props.material)
const coilColor = ref(props.color)
const coilLength = ref(props.length)

const printers = inject(printersKey)
const coils = inject(coilsKey)

if (!coils || !printers) {
  throw new Error('Service is not provided')
}

const { getCoilsData } = coils
const { getPrintersData } = printers

const isCuttingMode = ref(false)
const cutLength = ref(0)
const isEditingMode = ref(false)

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

const editModeHandle = () => (isEditingMode.value = !isEditingMode.value)

const editCoil = () => {
  if (props.printerProps) {
    if (validateFields()) {
      printersService
        .updateData(props.printerProps.id, {
          ...props.printerProps,
          coil: {
            ...props,
            material: coilMaterial.value,
            color: coilColor.value,
            length: coilLength.value,
          },
        })
        .then(() => {
          getPrintersData()
        })
      return
    } else {
      isEditingMode.value = false
      throw new CustomError('Invalid fields')
    }
  }
  if (validateFields()) {
    coilsService
      .updateData(props.id, {
        ...props,
        material: coilMaterial.value,
        color: coilColor.value,
        length: coilLength.value,
      })
      .then(() => {
        getCoilsData()
      })
    toastInstance.addToast('Coil edited!', 'success')
  } else {
    throw new CustomError('Invalid fields')
  }
}

const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const deleteCoil = () => {
  toastInstance.addToast(`Coil is Deleted`, 'warning')
  if (props.printerProps) {
    printersService
      .updateData(props.printerProps.id, {
        ...props.printerProps,
        coil: null,
      })
      .then(() => {
        getPrintersData()
      })
    return
  }
  coilsService.deleteData(props.id).then(() => {
    getCoilsData()
  })
}

const cut = () => {
  if (cutLength.value >= coilLength.value) {
    coilLength.value = 0
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

  coilLength.value -= cutLength.value
  if (props.printerProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printerProps, length, ...filteredProps } = props
    printersService.updateData(props.printerProps.id, {
      ...props.printerProps,
      coil: { ...filteredProps, length: coilLength.value },
    })
    toastInstance.addToast(`Coil is cutted`, 'success')
    return
  }
  coilsService.updateData(props.id, { ...props, length: coilLength.value })
  toastInstance.addToast(`Coil is cutted`, 'success')
}
</script>

<template>
  <li
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <div class="flex flex-column gap-1">
      <p>Material: {{ material }}</p>
      <p>Color: {{ color }}</p>
      <p>Length: {{ length }}m</p>
      <div :class="{ disabled: isPrinting }" class="flex flex-row gap-2">
        <button @click="cuttingModeHandle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-scissors"
            viewBox="0 0 16 16"
          >
            <path
              d="M3.5 3.5c-.614-.884-.074-1.962.858-2.5L8 7.226 11.642 1c.932.538 1.472 1.616.858 2.5L8.81 8.61l1.556 2.661a2.5 2.5 0 1 1-.794.637L8 9.73l-1.572 2.177a2.5 2.5 0 1 1-.794-.637L7.19 8.61zm2.5 10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m7 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"
            />
          </svg>
        </button>
        <button @click="editModeHandle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-pen-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001"
            />
          </svg>
        </button>
        <button @click="deleteCoil">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
            />
            <path
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
            />
          </svg>
        </button>
      </div>
    </div>
    <img width="100px" :src="imgUrl ? imgUrl : 'coil.png'" alt="coil-image" />
  </li>
  <DialogWindow :isOpen="isCuttingMode" @close="cuttingModeHandle" @confirm-action="cut()">
    <template #content>
      <p>Length: {{ coilLength }} m</p>
      <div class="input-box">
        <label for="cutLength">Choose cut length</label>
        <input
          id="cutLength"
          class="w-full"
          placeholder=""
          v-model="cutLength"
          min="0"
          :max="coilLength"
          type="number"
        />
      </div>
    </template>
  </DialogWindow>
  <DialogWindow :isOpen="isEditingMode" @close="editModeHandle" @confirmAction="editCoil">
    <template #content>
      <h2>Edit a {{ material }} coil</h2>
      <div class="input-box">
        <label for="material">Enter material</label>
        <input
          class="w-full"
          required
          placeholder=""
          maxlength="10"
          v-model="coilMaterial"
          :class="{ 'user-invalid': errors.coilMaterial }"
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
          :class="{ 'user-invalid': errors.coilColor }"
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
          :class="{ 'user-invalid': errors.coilLength }"
          id="length"
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
