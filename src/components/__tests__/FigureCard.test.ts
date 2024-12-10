import FigureCard from '@/components/Figure/card/FigureCard.vue'
import type { IFigure, IPrinter } from '@/model/interfaces'
import { figuresKey, printersKey } from '@/util/injectionKeys'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

describe('Тесты класса модели', () => {
  let figuresData: Ref<IFigure[]>,
    printersData: Ref<IPrinter[]>,
    getFiguresData = vi.fn(),
    getPrintersData = vi.fn()

  beforeEach(() => {
    figuresData = ref([{ id: '1', name: 'Figure1', perimeter: 5, isCompleted: false }])
    printersData = ref([
      { id: '1', name: 'Printer1', brand: 'Brand1', speed: 50, queue: [], coil: null },
    ])

    getFiguresData = vi.fn()
    getPrintersData = vi.fn()
  })

  it('инициализирует все поля корректно', () => {
    const props = {
      id: '1',
      name: 'Figure1',
      perimeter: 10,
      isCompleted: false,
      printerProps: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        queue: [],
        coil: null,
      },
      isPrinting: false,
    }

    const wrapper = mount(FigureCard, {
      props,
      global: {
        provide: {
          [figuresKey]: { figuresData, getFiguresData },
          [printersKey]: { printersData, getPrintersData },
        },
      },
    })

    expect(wrapper.props('id')).toBe(props.id)
    expect(wrapper.props('name')).toBe(props.name)
    expect(wrapper.props('perimeter')).toBe(props.perimeter)
    expect(wrapper.props('isCompleted')).toBe(props.isCompleted)

    expect(wrapper.vm.figureName).toBe(props.name)
    expect(wrapper.vm.figurePerimeter).toBe(props.perimeter)
    expect(wrapper.vm.isEditMode).toBe(false)

    expect(wrapper.vm.errors.figureName).toBe(false)
    expect(wrapper.vm.errors.figurePerimeter).toBe(false)
  })

  it('выбрасывает ошибку, если инжект не предоставлен', () => {
    const props = {
      id: '1',
      name: 'Figure1',
      perimeter: 10,
      isCompleted: false,
    }

    expect(() => {
      mount(FigureCard, { props })
    }).toThrow('Service is not provided')
  })
})
