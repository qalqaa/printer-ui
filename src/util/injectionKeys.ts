import type { IPrinter } from '@/model/interfaces'
import type { InjectionKey, Ref } from 'vue'

interface IProvideData {
  data: Ref<IPrinter[]>
  fetchData: () => Promise<void>
}

export const printersKey: InjectionKey<IProvideData> = Symbol('printers')
