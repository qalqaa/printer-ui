import { printersService } from '@/data/api/api'
import { usePrintersStore } from '@/stores/printersStore'
import PrinterView from '@/views/PrintersView.vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/api/api')

describe('PrintersView.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any
  let printersStore = usePrintersStore()

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    printersStore = usePrintersStore()

    printersStore.addPrinter({
      id: '1',
      name: 'Printer1',
      brand: 'Brand1',
      speed: 50,
      queue: [],
      coil: { id: '1', material: 'PLA', color: 'Black', length: 10 },
    })

    wrapper = mount(PrinterView, {
      global: {
        plugins: [pinia],
      },
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
  })

  it('Отображает список принтеров, если принтеры есть', async () => {
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'PrinterList' }).exists()).toBe(true)
  })
  it('Отображает сообщение о пустом списке, если принтеров нет', async () => {
    printersStore.deletePrinter('1')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No printers found')
  })

  it('Показывает ошибку, если поля не заполнены правильно', async () => {
    wrapper.vm.fields.printerName.value = ''
    wrapper.vm.fields.printerBrand.value = ''
    wrapper.vm.fields.printerSpeed.value = undefined

    await expect(wrapper.vm.createPrinter()).rejects.toThrow('Fill all required fields')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.printerName.value).toBe(true)
    expect(wrapper.vm.errors.printerBrand.value).toBe(true)
    expect(wrapper.vm.errors.printerSpeed.value).toBe(true)

    expect(printersService.postData).not.toHaveBeenCalled()
  })

  it('Проверяет создание принтера', async () => {
    wrapper.vm.fields.printerName.value = 'New Printer'
    wrapper.vm.fields.printerBrand.value = 'Brand A'
    wrapper.vm.fields.printerSpeed.value = 100

    wrapper.vm.createPrinter()
    wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.printerName.value).toBe(false)
    expect(wrapper.vm.errors.printerBrand.value).toBe(false)
    expect(wrapper.vm.errors.printerSpeed.value).toBe(false)

    expect(printersService.postData).toHaveBeenCalled()
    expect(printersStore.getPrinterById('1')).toBeDefined()
  })
})
