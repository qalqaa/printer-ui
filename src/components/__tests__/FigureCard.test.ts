import FigureCard from '@/components/Figure/card/FigureCard.vue'
import { CustomError } from '@/model/error/customError'
import { useFiguresStore } from '@/stores/figuresStore'
import { usePrintersStore } from '@/stores/printersStore'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

describe('FigureCard.vue (с использованием Pinia)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any
  let figuresStore = useFiguresStore()
  let printersStore = usePrintersStore()

  const props = {
    id: '52',
    name: 'Figure1',
    perimeter: 10,
    imgUrl: 'figure.png',
    isCompleted: false,
  }

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    figuresStore = useFiguresStore()
    printersStore = usePrintersStore()

    wrapper = mount(FigureCard, {
      props,
      global: {
        plugins: [pinia],
      },
    })
  })

  it('инициализирует все поля корректно', () => {
    expect(wrapper.props('id')).toBe(props.id)
    expect(wrapper.props('name')).toBe(props.name)
    expect(wrapper.props('perimeter')).toBe(props.perimeter)
  })

  it('выбрасывает ошибку, если не переданы обязательные свойства', () => {
    wrapper.vm.fields.figureName.value = ''
    expect(() => {
      wrapper.vm.editFigure()
    }).toThrowError(new CustomError('Fill all required fields'))
  })

  it('выбрасывает ошибку при отрицательном периметре', async () => {
    wrapper.vm.fields.figurePerimeter.value = -5
    await expect(() => wrapper.vm.editFigure()).toThrow("Perimeter can't be negative or null")

    expect(wrapper.vm.errors.figurePerimeter.value).toBe(true)
  })

  it('проверяет инициализацию глобальных состояний', () => {
    expect(figuresStore.getFigures).toEqual([])
    expect(printersStore.getPrinters).toEqual([])
  })

  it('выполняет успешное редактирование фигуры', async () => {
    const newFigureData = {
      ...props,
      name: 'UpdatedName',
      perimeter: 15,
    }

    figuresStore.addFigure(props)

    wrapper.vm.fields.figureName.value = 'UpdatedName'
    wrapper.vm.fields.figurePerimeter.value = 15
    await wrapper.vm.editFigure()

    expect(figuresStore.getFigureById(props.id)).toStrictEqual(newFigureData)
  })

  it('выполняет успешное удаление фигуры', async () => {
    figuresStore.addFigure(props)

    await wrapper.vm.deleteFigure()

    expect(figuresStore.getFigureById(props.id)).toBeUndefined()
  })
})
