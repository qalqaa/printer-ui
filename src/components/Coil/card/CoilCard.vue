<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { useColors } from '@/composables/useColors'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { coilsService, printersService } from '@/data/api/api'
import { colorsLib } from '@/data/static'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { coilsKey, printersKey } from '@/util/injectionKeys'
import { inject, ref } from 'vue'

const props = defineProps<ICoil & { printerProps?: IPrinter } & { isPrinting?: boolean }>()

const colors = useColors(props.color)

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

const { fields, errors, validateFields } = useFieldValidation(
  {
    coilMaterial: props.material,
    coilColor: props.color,
    coilLength: props.length,
  },
  {
    coilMaterial: (value) => value !== '',
    coilColor: (value) => value !== '',
    coilLength: (value) => value !== undefined && value > 0,
  },
)

const editModeHandle = () => (isEditingMode.value = !isEditingMode.value)

const editCoil = () => {
  if (fields.coilLength.value <= 0) {
    errors.coilLength.value = true
    throw new CustomError("Length can't be negative or null")
  }
  toastInstance.addToast('Coil edited!', 'success')
  if (props.printerProps) {
    if (validateFields()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { printerProps, isPrinting, length, ...filteredProps } = props
      printersService
        .updateData(props.printerProps.id, {
          ...props.printerProps,
          coil: {
            ...filteredProps,
            material: fields.coilMaterial.value,
            color: fields.coilColor.value,
            length: fields.coilLength.value,
          },
        })
        .then(() => {
          getPrintersData()
        })
    } else {
      throw new CustomError('Invalid fields')
    }
    return
  } else {
    if (validateFields()) {
      coilsService
        .updateData(props.id, {
          ...props,
          material: fields.coilMaterial.value,
          color: fields.coilColor.value,
          length: fields.coilLength.value,
        })
        .then(() => {
          getCoilsData()
        })
    } else {
      throw new CustomError('Invalid fields')
    }
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
  if (cutLength.value <= 0) {
    throw new CustomError('Cut length must be bigger than 0')
  }
  if (cutLength.value >= fields.coilLength.value) {
    fields.coilLength.value = 0
    coilsService.deleteData(props.id)
    throw new CustomError('Cut length is bigger than coil length')
  }
  if (props.printerProps) {
    printersService.updateData(props.printerProps.id, {
      ...props.printerProps,
      coil: null,
    })
    toastInstance.addToast(`Coil is cutted`, 'success')
  }
  fields.coilLength.value -= cutLength.value
  if (props.printerProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printerProps, length, ...filteredProps } = props
    printersService.updateData(props.printerProps.id, {
      ...props.printerProps,
      coil: { ...filteredProps, length: fields.coilLength.value },
    })
    toastInstance.addToast(`Coil is cutted`, 'success')
    return
  }
  coilsService.updateData(props.id, { ...props, length: fields.coilLength.value }).then(() => {
    getCoilsData()
  })
  toastInstance.addToast(`Coil is cutted`, 'success')
}
</script>

<template>
  <li
    class="flex flex-row gap-4 justify-content-between bg-color-soft p-4 border-round-xl shadow-5 relative"
  >
    <!-- :style="{ border: '1px solid ' + color }" -->
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
    <img
      width="150px"
      :src="imgUrl ? imgUrl : 'coil.webp'"
      alt="coil-image"
      :style="{ filter: 'hue-rotate(' + colors?.rotate + 'deg)' }"
    />
  </li>
  <DialogWindow :isOpen="isCuttingMode" @close="cuttingModeHandle" @confirm-action="cut()">
    <template #content>
      <p>Length: {{ fields.coilLength.value }} m</p>
      <div class="input-box">
        <label for="cutLength">Choose cut length</label>
        <input
          id="cutLength"
          class="w-full"
          placeholder=""
          v-model="cutLength"
          min="0"
          :max="fields.coilLength.value"
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

<style>
.blur {
  backdrop-filter: blur(10px);
}
</style>
