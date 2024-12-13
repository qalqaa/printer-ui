import type { IFigure } from '../interfaces'

export interface IFiguresState {
  figures: IFigure[]
}

export interface IFiguresGetters {
  [key: string]: (state: IFiguresState) => unknown
  getFigures: (state: IFiguresState) => IFigure[]
  getFigureById: (state: IFiguresState) => (id: string) => IFigure | undefined
  getBlueprints: (state: IFiguresState) => IFigure[]
  getCompletedFigures: (state: IFiguresState) => IFigure[]
  getSortedByName: (state: IFiguresState) => IFigure[]
  getSortedByPerimeter: (state: IFiguresState) => IFigure[]
}

export interface IFiguresActions {
  addFigure(figure: IFigure): void
  addArrayFigures(figures: IFigure[]): void
  deleteFigure(id: string): void
  deleteAllCompletedFigures(): void
  updateFigure(figure: IFigure): void
}
