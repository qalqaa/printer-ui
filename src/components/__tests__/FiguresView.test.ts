import type { IFigure } from '@/model/interfaces'
import { figuresKey } from '@/util/injectionKeys'
import FiguresView from '@/views/FiguresView.vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

describe('FiguresView.vue', () => {
  let figuresData: Ref<IFigure[]>, getFiguresData: () => IFigure[], wrapper

  beforeEach(() => {
    figuresData = ref([
      { id: '1', name: 'Square', perimeter: 40, isCompleted: false },
      { id: '2', name: 'Triangle', perimeter: 30, isCompleted: false },
      { id: '3', name: 'Circle', perimeter: 60, isCompleted: true },
    ])
    getFiguresData = vi.fn()
    wrapper = mount(FiguresView, {
      global: {
        provide: {
          [figuresKey]: { figuresData, getFiguresData },
        },
      },
    })
  })

  it('отображает список фигур, если есть незавершенные фигуры', () => {
    expect(wrapper.text()).not.toContain('No figures found 😫')
  })

  it('показывает сообщение о пустом списке, если нет незавершенных фигур', async () => {
    figuresData.value = []
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No figures found 😫')
  })

  it('сортирует список фигур по имени', async () => {
    const sortedFigures = [...figuresData.value].sort((a, b) => a.name.localeCompare(b.name))
    expect(sortedFigures[0].name).toBe('Circle')
    expect(sortedFigures[1].name).toBe('Square')
    expect(sortedFigures[2].name).toBe('Triangle')
  })

  it('сортирует список фигур по периметру', async () => {
    const sortedFigures = [...figuresData.value].sort((a, b) => a.perimeter - b.perimeter)
    expect(sortedFigures[0].perimeter).toBe(30)
    expect(sortedFigures[1].perimeter).toBe(40)
    expect(sortedFigures[2].perimeter).toBe(60)
  })

  it('показывает сообщение о пустом списке после удаления всех фигур', async () => {
    figuresData.value = []
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No figures found 😫')
  })
})
