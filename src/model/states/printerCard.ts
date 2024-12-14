import type { ICoil, IFigure } from '../interfaces'

export interface IPrinterCardState {
  isPrinting: boolean
  progress: number
  isQueueCollapsed: boolean
  isCoilCollapsed: boolean
  selectedCoil: ICoil | 'placeholder'
  selectedFigure: IFigure | 'placeholder'
}
