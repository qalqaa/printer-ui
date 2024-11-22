import type { Meter } from './types'

export interface IPlasticCoil {
  id: string
  material: string
  color: string
  length: Meter
}

export interface IFigure {
  id: string
  name: string
  perimeter: Meter
}

export interface IPrinter {
  id: string
  name: string
  brand: string
  imgUrl: string
  coil: IPlasticCoil | null
  queue: IFigure[] | null
}
