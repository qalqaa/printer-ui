import type {
  IPrintersActions,
  IPrintersGetters,
  IPrintersState,
} from '@/model/store-interfaces/printersStore'
import { defineStore } from 'pinia'

export const usePrintersStore = defineStore<
  'printersStore',
  IPrintersState,
  IPrintersGetters,
  IPrintersActions
>('printersStore', {
  state: (): IPrintersState => ({
    printers: [],
  }),
  getters: {
    getPrinters: (state) => state.printers,
    getPrinterById: (state) => (id) => state.printers.find((p) => p.id === id),
  },
  actions: {
    addPrinter(printer) {
      this.printers.push(printer)
    },
    addArrayPrinters(printers) {
      this.printers.push(...printers)
    },
    deletePrinter(id) {
      this.printers = this.printers.filter((printer) => printer.id !== id)
    },
    updatePrinter(printer) {
      const index = this.printers.findIndex((f) => f.id === printer.id)
      if (index !== -1) {
        this.printers[index] = printer
      }
    },
    removeCoil(id) {
      this.printers.forEach((printer) => {
        if (printer.coil?.id === id) {
          printer.coil = null
        }
      })
    },
    shortenCoil(id, shortenLength) {
      this.printers.forEach((printer) => {
        if (printer.id === id && printer.coil) {
          let updatedLength = printer.coil.length * 1000
          updatedLength -= shortenLength
          printer.coil.length = Math.max(updatedLength / 1000, 0)
        }
      })
    },
    addCoil(id, coil) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          printer.coil = coil
        }
      })
    },
    clearQueue(id) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          printer.queue = null
        }
      })
    },
    addToQueue(id, figure) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) printer.queue = []
          printer.queue.push(figure)
        }
      })
    },
    removeFromQueue(id, figureID) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) return
          printer.queue = printer.queue.filter((f) => f.id !== figureID)
        }
      })
    },
    editInQueue(id, figure) {
      this.printers.forEach((printer) => {
        if (printer.id === id) {
          if (!printer.queue) return
          printer.queue = printer.queue.map((f) => (f.id === figure.id ? figure : f))
        }
      })
    },
  },
})
