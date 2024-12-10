import CoilCard from '@/components/Coil/card/CoilCard.vue'
import { CustomError } from '@/model/error/customError'
import type { ICoil, IPrinter } from '@/model/interfaces'
import { coilsKey, printersKey } from '@/util/injectionKeys'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

describe('Инициализация и расчет длины катушки', () => {
  let coilsData: Ref<ICoil[]>,
    printersData: Ref<IPrinter[]>,
    getCoilsData = vi.fn()

  const getPrintersData = vi.fn()

  beforeEach(() => {
    coilsData = ref([{ id: '1', material: 'PLA', color: 'Black', length: 1000 }])
    getCoilsData = vi.fn()
  })

  it('инициализирует все поля корректно', () => {
    const props = {
      id: '1',
      material: 'PLA',
      color: 'Black',
      length: 1000,
    }

    const wrapper = mount(CoilCard, {
      props,
      global: {
        provide: {
          [coilsKey]: { coilsData, getCoilsData },
          [printersKey]: { printersData, getPrintersData },
        },
      },
    })

    expect(wrapper.props('id')).toBe(props.id)
    expect(wrapper.props('material')).toBe(props.material)
    expect(wrapper.props('color')).toBe(props.color)
    expect(wrapper.props('length')).toBe(props.length)

    expect(wrapper.vm.coilLength).toBe(props.length)
  })

  it('рассчитывает оставшуюся длину после подрезки', async () => {
    const props = {
      id: '1',
      material: 'PLA',
      color: 'Black',
      length: 1000,
    }

    const wrapper = mount(CoilCard, {
      props,
      global: {
        provide: {
          [coilsKey]: { coilsData, getCoilsData },
          [printersKey]: { printersData, getPrintersData },
        },
      },
    })

    expect(wrapper.vm.coilLength).toBe(1000)

    wrapper.vm.cutLength = 200

    await wrapper.vm.cut()

    await expect(wrapper.vm.coilLength).toBe(800)

    wrapper.vm.cutLength = 300
    await wrapper.vm.cut()

    expect(wrapper.vm.coilLength).toBe(500)
  })

  it('выбрасывает ошибку, если расходуемая длина превышает оставшуюся', async () => {
    const props = {
      id: '1',
      material: 'PLA',
      color: 'Black',
      length: 1000,
    }

    const wrapper = mount(CoilCard, {
      props,
      global: {
        provide: {
          [coilsKey]: { coilsData, getCoilsData },
          [printersKey]: { printersData, getPrintersData },
        },
      },
    })

    wrapper.vm.cutLength = 1500

    expect(() => wrapper.vm.cut()).toThrow(CustomError)
    expect(() => wrapper.vm.cut()).toThrow('Cut length is bigger than coil length')
  })

  it('не позволяет расходовать отрицательное количество материала', async () => {
    const props = {
      id: '1',
      material: 'PLA',
      color: 'Black',
      length: 1000,
    }

    const wrapper = mount(CoilCard, {
      props,
      global: {
        provide: {
          [coilsKey]: { coilsData, getCoilsData },
          [printersKey]: { printersData, getPrintersData },
        },
      },
    })

    wrapper.vm.cutLength = -50

    expect(() => wrapper.vm.cut()).toThrow(Error)
    expect(() => wrapper.vm.cut()).toThrow('Cut length must be bigger than 0')
  })
})
