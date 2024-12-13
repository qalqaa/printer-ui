import type { IFigure } from '@/model/interfaces'
import type {
  IFiguresActions,
  IFiguresGetters,
  IFiguresState,
} from '@/model/store-interfaces/figuresStore'
import { defineStore } from 'pinia'

export const useFiguresStore = defineStore<
  'figuresStore',
  IFiguresState,
  IFiguresGetters,
  IFiguresActions
>('figuresStore', {
  state: () => ({
    figures: [] as IFigure[],
  }),
  getters: {
    getFigures(): IFigure[] {
      return this.figures
    },
    getFigureById: (state) => (id: string) => state.figures.find((p) => p.id === id),
    getBlueprints(): IFigure[] {
      return this.figures.filter((figure: IFigure) => !figure.isCompleted)
    },
    getCompletedFigures(): IFigure[] {
      return this.figures.filter((figure: IFigure) => figure.isCompleted)
    },
    getSortedByName(): IFigure[] {
      return this.figures.sort((a, b) => a.name.localeCompare(b.name))
    },
    getSortedByPerimeter(): IFigure[] {
      return this.figures.sort((a, b) => a.perimeter - b.perimeter)
    },
  },
  actions: {
    addFigure(figure) {
      this.figures.push(figure)
    },
    addArrayFigures(figures) {
      this.figures.push(...figures)
    },
    deleteFigure(id) {
      this.figures = this.figures.filter((figure) => figure.id !== id)
    },
    deleteAllCompletedFigures() {
      this.figures = this.figures.filter((figure) => !figure.isCompleted)
    },
    updateFigure(figure) {
      const index = this.figures.findIndex((f) => f.id === figure.id)
      if (index !== -1) {
        this.figures[index] = figure
      }
    },
  },
})
