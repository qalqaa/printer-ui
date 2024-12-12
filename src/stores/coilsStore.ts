import type { ICoil } from '@/model/interfaces'
import { defineStore } from 'pinia'

export const useCoilsStore = defineStore('coilStore', {
  state: () => ({
    coils: [] as ICoil[],
  }),
  getters: {
    getCoils: (state) => state.coils,
  },
  actions: {
    addCoil(coil: ICoil) {
      this.coils.push(coil)
    },
    addArrayCoils(coils: ICoil[]) {
      this.coils.push(...coils)
    },
    deleteCoil(id: string) {
      this.coils = this.coils.filter((coil) => coil.id !== id)
    },
    updateCoil(coil: ICoil) {
      const index = this.coils.findIndex((f) => f.id === coil.id)
      if (index !== -1) {
        this.coils[index] = coil
      }
    },
  },
})
