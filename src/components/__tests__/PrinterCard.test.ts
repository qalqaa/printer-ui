import PrinterCard from '@/components/Printer/PrinterCard/PrinterCard.vue'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { coilsKey, figuresKey, printersKey } from '@/util/injectionKeys'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

describe('Методы запуска печати и установки/снятия катушки', () => {
  let printersData: Ref<IPrinter[]>,
    coilsData: Ref<ICoil[]>,
    figuresData: Ref<IFigure[]>,
    getPrintersData = vi.fn(),
    getCoilsData = vi.fn(),
    getFiguresData = vi.fn()

  beforeEach(() => {
    printersData = ref([
      { id: '1', name: 'Printer1', brand: 'Brand1', speed: 50, queue: [], coil: null },
    ])
    coilsData = ref([{ id: '1', material: 'PLA', color: 'Black', length: 10 }])
    figuresData = ref([{ id: '1', name: 'Figure1', perimeter: 5, isCompleted: false }])

    getPrintersData = vi.fn()
    getCoilsData = vi.fn()
    getFiguresData = vi.fn()
  })

  it('статус принтера меняется на «печать»', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: {
          id: '1',
          material: 'PLA',
          color: 'Black',
          length: 10,
        },
        queue: [{ id: '12', name: 'Figure1', perimeter: 5, isCompleted: false }],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData, getCoilsData },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    await wrapper.vm.print()

    expect(wrapper.vm.isPrinting).toBe(true)
  })

  it('выбрасывает ошибку, если не назначена модель', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: {
          id: '12',
          material: 'PLA',
          color: 'Black',
          length: 10,
        },
        queue: [],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData, getCoilsData },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    wrapper.vm.selectedCoil = 'placeholder'

    expect(() => wrapper.vm.print()).toThrow(CustomError)
    expect(() => wrapper.vm.print()).toThrow('No figures in queue')
  })

  it('выдает ошибку, если не установлена катушка', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: null,
        queue: [
          {
            id: '12',
            name: 'Figure1',
            perimeter: 5,
            isCompleted: false,
          },
        ],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData: ref([]), getCoilsData: vi.fn() },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    coilsData.value = []

    expect(() => wrapper.vm.print()).toThrow(CustomError)
    expect(() => wrapper.vm.print()).toThrow('No coil inside printer, first refill it')
  })

  it('катушка устанавливается', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: null,
        queue: [],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData, getCoilsData },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    wrapper.vm.selectedCoil = { id: 'ix8rinu', material: 'Plastic', color: 'red', length: 2000 }

    await wrapper.vm.refill()

    expect(wrapper.vm.selectedCoil).toEqual({
      id: 'ix8rinu',
      material: 'Plastic',
      color: 'red',
      length: 2000,
    })
  })

  it('Нельзя установить вторую катушку, если одна уже установлена', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: {
          id: '1',
          material: 'PLA',
          color: 'Black',
          length: 10,
        },
        queue: [],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData, getCoilsData },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    expect(() =>
      wrapper.vm.refill({ id: '2', material: 'ABS', color: 'White', length: 15 }),
    ).toThrow(CustomError)
    expect(() =>
      wrapper.vm.refill({ id: '2', material: 'ABS', color: 'White', length: 15 }),
    ).toThrow('Coil is already installed')
  })

  it('Нельзя снять катушку при запущенной печати', async () => {
    const wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: {
          id: '1',
          material: 'PLA',
          color: 'Black',
          length: 10,
        },
        queue: [{ id: '12', name: 'Figure1', perimeter: 5, isCompleted: false }],
      },
      global: {
        provide: {
          [printersKey]: { printersData, getPrintersData },
          [coilsKey]: { coilsData, getCoilsData },
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })

    wrapper.vm.isPrinting = true

    expect(() => wrapper.vm.refill()).toThrow(CustomError)
    expect(() => wrapper.vm.refill()).toThrow('Cannot remove coil while printing')
  })
})
