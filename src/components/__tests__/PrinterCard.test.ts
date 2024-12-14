import PrinterCard from '@/components/Printer/PrinterCard/PrinterCard.vue'
import { CustomError } from '@/model/error/customError'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('Методы запуска печати и установки/снятия катушки', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any
  it('статус принтера меняется на «печать»', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    await wrapper.vm.print()

    expect(wrapper.vm.state.isPrinting).toBe(true)
  })

  it('отображает прогресс печати', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    await wrapper.vm.print()

    const progressBar = wrapper.find('#print-status')

    expect(progressBar.text()).toContain('Print status: printing... 0%')
  })

  it('выбрасывает ошибку, если не назначена модель', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    expect(() => wrapper.vm.print()).toThrow(CustomError)
    expect(() => wrapper.vm.print()).toThrow('No figures in queue')
  })

  it('выдает ошибку, если не установлена катушка', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    expect(() => wrapper.vm.print()).toThrow(CustomError)
    expect(() => wrapper.vm.print()).toThrow('No coil inside printer, first refill it')
  })

  it('катушка устанавливается', async () => {
    wrapper = mount(PrinterCard, {
      props: {
        id: '1',
        name: 'Printer1',
        brand: 'Brand1',
        speed: 50,
        coil: null,
        queue: [],
      },
    })

    const selectedCoil = { id: 'ix8rinu', material: 'Plastic', color: 'red', length: 2000 }

    wrapper.vm.state.selectedCoil = selectedCoil

    await wrapper.vm.refill()

    expect(wrapper.vm.state.selectedCoil).toEqual({
      id: 'ix8rinu',
      material: 'Plastic',
      color: 'red',
      length: 2000,
    })
  })

  it('Нельзя установить вторую катушку, если одна уже установлена', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    expect(() =>
      wrapper.vm.refill({ id: '2', material: 'ABS', color: 'White', length: 15 }),
    ).toThrow(CustomError)
    expect(() =>
      wrapper.vm.refill({ id: '2', material: 'ABS', color: 'White', length: 15 }),
    ).toThrow('Coil is already installed')
  })

  it('Нельзя снять катушку при запущенной печати', async () => {
    wrapper = mount(PrinterCard, {
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
    })

    wrapper.vm.state.isPrinting = true

    expect(() => wrapper.vm.refill()).toThrow(CustomError)
    expect(() => wrapper.vm.refill()).toThrow('Cannot remove coil while printing')
  })
})
