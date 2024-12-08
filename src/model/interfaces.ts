import type { Meter } from './types'

export interface ICoil {
  id: string
  material: string
  color: string
  length: Meter
  imgUrl?: string
}

export interface IFigure {
  id: string
  name: string
  perimeter: Meter
  imgUrl?: string
}

export interface IPrinter {
  id: string
  name: string
  brand: string
  imgUrl?: string
  coil: ICoil | null
  queue: IFigure[] | null
}
