import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { defineStore } from 'pinia'

export const usePrintersStore = defineStore('printersStore', {
  state: () => ({
    printers: [] as IPrinter[],
  }),
  getters: {
    getPrinters: (state): IPrinter[] => state.printers,
    getPrinterById: (state) => (id: string) => state.printers.find((p) => p.id === id),
  },
  actions: {
    addPrinter(printer: IPrinter) {
      this.printers.push(printer)
    },
    addArrayPrinters(printers: IPrinter[]) {
      this.printers.push(...printers)
    },
    deletePrinter(id: string) {
      this.printers = this.printers.filter((printer) => printer.id !== id)
    },
    updatePrinter(printer: IPrinter) {
      const index = this.printers.findIndex((f) => f.id === printer.id)
      if (index !== -1) {
        this.printers[index] = printer
      }
    },
    removeCoil(id: string) {
      this.printers.forEach((printer) => {
        if (printer.coil?.id === id) {
          printer.coil = null
        }
      })
    },
    addCoil(id: string, coil: ICoil) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          printer.coil = coil
        }
      })
    },
    clearQueue(id: string) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          printer.queue = null
        }
      })
    },
    addToQueue(id: string, figure: IFigure) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) printer.queue = []
          printer.queue.push(figure)
        }
      })
    },
    removeFromQueue(id: string, figureID: string) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) return
          printer.queue = printer.queue.filter((f) => f.id !== figureID)
        }
      })
    },
    editInQueue(id: string, figure: IFigure) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) return
          printer.queue = printer.queue.map((f) => (f.id === figure.id ? figure : f))
        }
      })
    },
  },
})
