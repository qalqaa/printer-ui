import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import type { InjectionKey, Ref } from 'vue'

interface IProvidePrinters {
  printersData: Ref<IPrinter[]>
  getPrintersData: () => Promise<void>
}

interface IProvideCoils {
  coilsData: Ref<ICoil[]>
  getCoilsData: () => Promise<void>
}

interface IProvideFigures {
  figuresData: Ref<IFigure[]>
  getFiguresData: () => Promise<void>
}

export const printersKey: InjectionKey<IProvidePrinters> = Symbol('printers')
export const coilsKey: InjectionKey<IProvideCoils> = Symbol('coils')
export const figuresKey: InjectionKey<IProvideFigures> = Symbol('figures')
