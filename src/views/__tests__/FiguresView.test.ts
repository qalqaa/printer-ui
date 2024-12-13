import { figuresService } from '@/data/api/api'
import { useFiguresStore } from '@/stores/figuresStore'
import FiguresView from '@/views/FiguresView.vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/api/api')

describe('FiguresView.vue', () => {
  let figuresStore = useFiguresStore(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper: any

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    figuresStore = useFiguresStore()

    figuresStore.addFigure({
      id: '52',
      name: 'Bebra',
      perimeter: 52,
      imgUrl: 'figure.png',
      isCompleted: false,
    })

    figuresStore.addFigure({
      id: 'иэтот',
      name: 'Abobus',
      perimeter: 89,
      imgUrl: 'figure.png',
      isCompleted: false,
    })

    figuresStore.addFigure({
      id: 'городнаш',
      name: 'SussyBaka',
      perimeter: 488,
      imgUrl: 'figure.png',
      isCompleted: false,
    })

    wrapper = mount(FiguresView, {
      global: {
        plugins: [pinia],
      },
      props: {
        id: '3cjzp97',
        name: 'Bebra',
        perimeter: 21301,
        imgUrl: 'figure.png',
        isCompleted: false,
      },
    })
  })

  it('отображает список фигур, если есть незавершенные фигуры', () => {
    expect(wrapper.text()).not.toContain('No figures found 😫')
  })

  it('показывает сообщение о пустом списке, если нет незавершенных фигур', async () => {
    figuresStore.deleteFigure('52')
    figuresStore.deleteFigure('иэтот')
    figuresStore.deleteFigure('городнаш')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No figures found 😫')
  })

  it('сортирует список фигур по имени', async () => {
    const sortedFigures = figuresStore.getSortedByName
    expect(sortedFigures[0].name).toBe('Abobus')
    expect(sortedFigures[1].name).toBe('Bebra')
    expect(sortedFigures[2].name).toBe('SussyBaka')
  })

  it('сортирует список фигур по периметру', async () => {
    const sortedFigures = figuresStore.getSortedByPerimeter
    expect(sortedFigures[0].perimeter).toBe(52)
    expect(sortedFigures[1].perimeter).toBe(89)
    expect(sortedFigures[2].perimeter).toBe(488)
  })

  it('показывает сообщение о пустом списке после удаления всех фигур', async () => {
    figuresStore.deleteFigure('52')
    figuresStore.deleteFigure('иэтот')
    figuresStore.deleteFigure('городнаш')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No figures found 😫')
  })

  it('выводит только завершенные фигуры', async () => {
    expect(figuresStore.getCompletedFigures).toStrictEqual([])
  })

  it('выводит только незавершенные фигуры', async () => {
    expect(figuresStore.getBlueprints).toStrictEqual([
      {
        id: '52',
        name: 'Bebra',
        perimeter: 52,
        imgUrl: 'figure.png',
        isCompleted: false,
      },
      {
        id: 'иэтот',
        name: 'Abobus',
        perimeter: 89,
        imgUrl: 'figure.png',
        isCompleted: false,
      },
      {
        id: 'городнаш',
        name: 'SussyBaka',
        perimeter: 488,
        imgUrl: 'figure.png',
        isCompleted: false,
      },
    ])
  })
  it('показывает ошибку, если поля не заполнены правильно', async () => {
    wrapper.vm.fields.figureName.value = ''
    wrapper.vm.fields.figurePerimeter.value = undefined

    await expect(wrapper.vm.createFigure()).rejects.toThrow('Fill all required fields')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.figureName.value).toBe(true)
    expect(wrapper.vm.errors.figurePerimeter.value).toBe(true)

    expect(figuresService.postData).not.toHaveBeenCalled()
  })

  it('проверяет создание модели', async () => {
    wrapper.vm.fields.figureName.value = 'ss'
    wrapper.vm.fields.figurePerimeter.value = 52

    wrapper.vm.createFigure()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.figureName.value).toBe(false)
    expect(wrapper.vm.errors.figurePerimeter.value).toBe(false)

    expect(figuresService.postData).toHaveBeenCalled()
    expect(figuresStore.getFigureById('52')).toBeDefined()
  })
})
