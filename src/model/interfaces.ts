import type { Meter, MillimeterPerSecond } from './types'

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
  isCompleted: boolean
  color?: string
}

export interface IPrinter {
  id: string
  name: string
  brand: string
  speed: MillimeterPerSecond
  imgUrl?: string
  coil: ICoil | null
  queue: IFigure[] | null
}

export interface IColor {
  color: string
  rotate: number
}
