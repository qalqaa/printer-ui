import type { IFigure } from '@/model/interfaces'
import { defineStore } from 'pinia'

export const useFiguresStore = defineStore('figureStore', {
  state: () => ({
    figures: [] as IFigure[],
  }),
  getters: {
    getAllFigures(): IFigure[] {
      return this.figures
    },
    getBlueprints(): IFigure[] {
      return this.figures.filter((figure: IFigure) => !figure.isCompleted)
    },
    getCompletedFigures(): IFigure[] {
      return this.figures.filter((figure: IFigure) => figure.isCompleted)
    },
  },

  actions: {
    addFigure(figure: IFigure) {
      this.figures.push(figure)
    },
    addArrayFigures(figures: IFigure[]) {
      this.figures.push(...figures)
    },
    deleteFigure(id: string) {
      this.figures = this.figures.filter((figure) => figure.id !== id)
    },
    deleteAllCompletedFigures() {
      this.figures = this.figures.filter((figure) => !figure.isCompleted)
    },
    updateFigure(figure: IFigure) {
      const index = this.figures.findIndex((f) => f.id === figure.id)
      if (index !== -1) {
        this.figures[index] = figure
      }
    },
  },
})
