import type { Meter } from './types'

export interface PlasticCoil {
  id: string
  material: string
  color: string
  length: Meter
}

export interface Figure {
  id: string
  name: string
  perimeter: Meter
}
