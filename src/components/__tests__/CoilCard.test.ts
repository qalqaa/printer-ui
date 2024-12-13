import CoilCard from '@/components/Coil/card/CoilCard.vue'
import { CustomError } from '@/model/error/customError'
import { useCoilsStore } from '@/stores/coilsStore'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Инициализация и расчет длины катушки', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any
  let coilsStore = useCoilsStore()

  const props = {
    id: '42',
    material: 'ginger',
    color: 'red',
    length: 1000,
  }

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    coilsStore = useCoilsStore()

    wrapper = mount(CoilCard, {
      props,
      global: {
        plugins: [pinia],
      },
    })
  })

  it('инициализирует все поля корректно', () => {
    expect(wrapper.props('id')).toBe(props.id)
    expect(wrapper.props('material')).toBe(props.material)
    expect(wrapper.props('color')).toBe(props.color)
    expect(wrapper.props('length')).toBe(props.length)
  })

  it('рассчитывает оставшуюся длину после подрезки', async () => {
    expect(wrapper.vm.fields.coilLength.value).toBe(1000)

    wrapper.vm.cutLength = 200

    await wrapper.vm.cut()

    await expect(wrapper.vm.fields.coilLength.value).toBe(800)

    wrapper.vm.cutLength = 300
    await wrapper.vm.cut()

    expect(wrapper.vm.fields.coilLength.value).toBe(500)
  })

  it('выбрасывает ошибку, если расходуемая длина превышает оставшуюся', async () => {
    wrapper.vm.cutLength = 1500

    expect(() => wrapper.vm.cut()).toThrow(CustomError)
    expect(() => wrapper.vm.cut()).toThrow('Cut length is bigger than coil length')
  })

  it('не позволяет расходовать отрицательное количество материала', async () => {
    wrapper.vm.cutLength = -50

    expect(() => wrapper.vm.cut()).toThrow(Error)
    expect(() => wrapper.vm.cut()).toThrow('Cut length must be bigger than 0')
  })
  it('успешно выполняет редактирование катушки', async () => {
    const newCoilData = {
      ...props,
      material: 'UpdatedMaterial',
      length: 150,
    }

    coilsStore.addCoil(props)

    wrapper.vm.fields.coilMaterial.value = 'UpdatedMaterial'
    wrapper.vm.fields.coilLength.value = 150
    await wrapper.vm.editCoil()

    expect(coilsStore.getCoilById(props.id)).toStrictEqual(newCoilData)
  })
  it('успешно выполняет удаление катушки', async () => {
    coilsStore.addCoil(props)

    await wrapper.vm.deleteCoil()

    expect(coilsStore.getCoils).toStrictEqual([])
  })
})
