<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import { useColors } from '@/composables/useColors'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { coilsService, printersService } from '@/data/api/api'
import { colorsLib } from '@/data/static'
import { toastInstance } from '@/main'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { useCoilsStore } from '@/stores/coilsStore'
import { usePrintersStore } from '@/stores/printersStore'
import { ref } from 'vue'

const props = defineProps<ICoil & { printerProps?: IPrinter } & { isPrinting?: boolean }>()

let colors = useColors(props.color)

const coilsStore = useCoilsStore()
const printersStore = usePrintersStore()

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
  if (validateFields()) {
    const editedCoil = {
      ...props,
      material: fields.coilMaterial.value,
      color: fields.coilColor.value,
      length: fields.coilLength.value,
    }
    coilsService.updateData(props.id, editedCoil)
    coilsStore.updateCoil(editedCoil)
    colors = useColors(editedCoil.color)
  } else {
    throw new CustomError('Invalid fields')
  }
}

const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const deleteCoil = () => {
  if (props.printerProps) {
    toastInstance.addToast(`Coil returned`, 'warning')
    const printerWithoutCoil = {
      ...props.printerProps,
      coil: null,
    }
    const coilWithoutPrinterProps: ICoil = {
      id: props.id,
      material: props.material,
      color: props.color,
      length: props.length,
      imgUrl: props.imgUrl,
    }
    coilsStore.addCoil(coilWithoutPrinterProps)
    printersStore.updatePrinter(printerWithoutCoil)
    coilsService.postData(coilWithoutPrinterProps)
    printersService.updateData(props.printerProps.id, printerWithoutCoil)
    return
  }
  toastInstance.addToast(`Coil is Deleted`, 'warning')
  coilsStore.deleteCoil(props.id)
  coilsService.deleteData(props.id)
}

const cut = () => {
  if (cutLength.value <= 0) {
    throw new CustomError('Cut length must be bigger than 0')
  }

  if (props.printerProps) {
    if (cutLength.value >= fields.coilLength.value) {
      const printerWithoutCoil: IPrinter = {
        ...props.printerProps,
        coil: null,
      }
      printersStore.updatePrinter(printerWithoutCoil)
      printersService.updateData(props.printerProps.id, printerWithoutCoil)
      throw new CustomError('Cut length is bigger than coil length, coil removed')
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printerProps, length, ...filteredProps } = props
    const printerWithShortCoil: IPrinter = {
      ...props.printerProps,
      coil: { ...filteredProps, length: fields.coilLength.value - cutLength.value },
    }
    printersStore.updatePrinter(printerWithShortCoil)
    printersService.updateData(props.printerProps.id, printerWithShortCoil)
    toastInstance.addToast(`Coil is cutted`, 'success')
    return
  }
  if (cutLength.value >= fields.coilLength.value) {
    fields.coilLength.value = 0
    coilsStore.deleteCoil(props.id)
    coilsService.deleteData(props.id)
    throw new CustomError('Cut length is bigger than coil length, coil removed')
  }
  fields.coilLength.value -= cutLength.value
  const updatedCoil: ICoil = { ...props, length: fields.coilLength.value }
  coilsStore.updateCoil(updatedCoil)
  coilsService.updateData(props.id, updatedCoil)
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
        <button v-if="!props.printerProps" @click="editModeHandle">
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
        <button class="pt-2" @click="deleteCoil">
          <svg
            v-if="!props.printerProps"
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
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-return-right"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5"
            />
          </svg>
        </button>
      </div>
    </div>
    <img
      width="100px"
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
