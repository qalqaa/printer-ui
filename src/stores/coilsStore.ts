import type { ICoilsActions, ICoilsGetters, ICoilsState } from '@/model/store-interfaces/coilsStore'
import { defineStore } from 'pinia'

export const useCoilsStore = defineStore<'coilsStore', ICoilsState, ICoilsGetters, ICoilsActions>(
  'coilsStore',
  {
    state: (): ICoilsState => ({
      coils: [],
    }),
    getters: {
      getCoils: (state) => state.coils,
      getCoilById: (state) => (id) => state.coils.find((coil) => coil.id === id),
    },
    actions: {
      addCoil(coil) {
        this.coils.push(coil)
      },
      addArrayCoils(coils) {
        this.coils.push(...coils)
      },
      deleteCoil(id) {
        this.coils = this.coils.filter((coil) => coil.id !== id)
      },
      updateCoil(coil) {
        const index = this.coils.findIndex((f) => f.id === coil.id)
        if (index !== -1) {
          this.coils[index] = coil
        }
      },
    },
  },
)
