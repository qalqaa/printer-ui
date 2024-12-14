<script setup lang="ts">
import DialogWindow from '@/components/DialogWindow/DialogWindow.vue'
import PenSvg from '@/components/Svg/PenSvg.vue'
import ReturnSvg from '@/components/Svg/ReturnSvg.vue'
import ScissorsSvg from '@/components/Svg/ScissorsSvg.vue'
import TrashSvg from '@/components/Svg/TrashSvg.vue'
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

const coilsStore = useCoilsStore()
const printersStore = usePrintersStore()

const isCuttingMode = ref(false)
const cutLength = ref(0)
const isEditingMode = ref(false)

let colors = useColors(props.color)

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
const cuttingModeHandle = () => (isCuttingMode.value = !isCuttingMode.value)

const editCoil = () => {
  if (fields.coilLength.value <= 0) {
    errors.coilLength.value = true
    throw new CustomError("Length can't be negative or null")
  }
  toastInstance.addToast('Coil edited!', 'success')

  if (validateFields()) {
    const filteredProps = {
      id: props.id,
      material: fields.coilMaterial.value,
      color: fields.coilColor.value,
      length: fields.coilLength.value,
    }
    coilsService.updateData(props.id, filteredProps)
    coilsStore.updateCoil(filteredProps)
    colors = useColors(filteredProps.color)
  } else {
    throw new CustomError('Invalid fields')
  }
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
    const filteredProps = {
      id: props.id,
      material: props.material,
      color: props.color,
    }
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
          <ScissorsSvg />
        </button>
        <button v-if="!props.printerProps" @click="editModeHandle">
          <PenSvg />
        </button>
        <button class="pt-2" @click="deleteCoil">
          <TrashSvg v-if="!props.printerProps" />
          <ReturnSvg v-else />
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
