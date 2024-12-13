import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'

export interface IPrintersState {
  printers: IPrinter[]
}

export interface IPrintersGetters {
  [key: string]: (state: IPrintersState) => unknown
  getPrinters: (state: IPrintersState) => IPrinter[]
  getPrinterById: (state: IPrintersState) => (id: string) => IPrinter | undefined
}

export interface IPrintersActions {
  addPrinter(printer: IPrinter): void
  addArrayPrinters(printers: IPrinter[]): void
  deletePrinter(id: string): void
  updatePrinter(printer: IPrinter): void
  removeCoil(id: string): void
  shortenCoil(id: string, shortenLength: number): void
  addCoil(id: string, coil: ICoil): void
  clearQueue(id: string): void
  addToQueue(id: string, figure: IFigure): void
  removeFromQueue(id: string, figureID: string): void
  editInQueue(id: string, figure: IFigure): void
}
