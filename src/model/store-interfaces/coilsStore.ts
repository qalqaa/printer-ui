import type { ICoil } from '../interfaces'

export interface ICoilsState {
  coils: ICoil[]
}

export interface ICoilsGetters {
  [key: string]: (state: ICoilsState) => unknown
  getCoils: (state: ICoilsState) => ICoil[]
  getCoilById: (state: ICoilsState) => (id: string) => ICoil | undefined
}

export interface ICoilsActions {
  addCoil(coil: ICoil): void
  addArrayCoils(coils: ICoil[]): void
  deleteCoil(id: string): void
  updateCoil(coil: ICoil): void
}
