import { printersService } from '@/data/api/api'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

vi.mock('@/data/api/api')

describe('PrintersPage.vue', () => {
  let wrapper,
    printersData: Ref<IPrinter[]>,
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

  it('Отображает список принтеров, если принтеры есть', async () => {
    const wrapper = mount(Printer, {
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

    await wrapper.vm.$nextTick()

    // Проверяем, что список принтеров отображается
    expect(wrapper.findComponent({ name: 'PrinterList' }).exists()).toBe(true)
  })

  it('Отображает сообщение о пустом списке, если принтеров нет', async () => {
    printersService.getData.mockResolvedValueOnce([])
    await wrapper.vm.$nextTick()

    // Проверяем, что сообщение о пустом списке отображается
    expect(wrapper.text()).toContain('No figures found')
  })

  it('Показывает процент выполнения для принтеров', async () => {
    printersService.getData.mockResolvedValueOnce([
      { id: 1, name: 'Printer 1', progress: 50, queue: [] },
    ])
    await wrapper.vm.$nextTick()

    // Проверяем отображение процентов
    const printerElement = wrapper.find('.printer-progress')
    expect(printerElement.text()).toContain('50%')
  })

  it('Показывает ошибку, если поля не заполнены правильно', async () => {
    const nameInput = wrapper.find('#printerName')
    const brandInput = wrapper.find('#printerBrand')
    const speedInput = wrapper.find('#printerSpeed')

    // Заполняем поля неправильно или не заполняем их вообще
    await nameInput.setValue('')
    await brandInput.setValue('')
    await speedInput.setValue(0)

    const form = wrapper.find('form')
    await form.trigger('submit')

    // Проверяем, что ошибки отображаются
    expect(wrapper.text()).toContain('Fill all required fields')
  })

  it('Проверяет создание принтера', async () => {
    printersService.postData.mockResolvedValueOnce({})
    const nameInput = wrapper.find('#printerName')
    const brandInput = wrapper.find('#printerBrand')
    const speedInput = wrapper.find('#printerSpeed')

    await nameInput.setValue('New Printer')
    await brandInput.setValue('Brand A')
    await speedInput.setValue(100)

    const createButton = wrapper.find('[type="submit"]')
    await createButton.trigger('click')

    // Проверяем, что сервис создания принтера был вызван
    expect(printersService.postData).toHaveBeenCalled()
  })
})
