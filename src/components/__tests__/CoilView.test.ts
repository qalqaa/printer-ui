import { coilsService } from '@/data/api/api'
import { useCoilsStore } from '@/stores/coilsStore'
import CoilsView from '@/views/CoilsView.vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/api/api')

describe('CoilsView.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any
  let coilsStore = useCoilsStore()

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    coilsStore = useCoilsStore()

    coilsStore.addCoil({
      id: '1',
      material: 'PLA',
      color: 'Black',
      length: 100,
    })

    wrapper = mount(CoilsView, {
      global: {
        plugins: [pinia],
      },
      props: {
        id: '1',
        material: 'PLA',
        color: 'Black',
        length: 100,
      },
    })
  })

  it('Отображает список катушек, если катушки есть', async () => {
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'CoilList' }).exists()).toBe(true)
  })
  it('Отображает сообщение о пустом списке, если катушек нет', async () => {
    coilsStore.deleteCoil('1')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No coils found 😢')
  })

  it('Показывает ошибку, если поля не заполнены правильно', async () => {
    wrapper.vm.fields.coilMaterial.value = ''
    wrapper.vm.fields.coilColor.value = ''
    wrapper.vm.fields.coilLength.value = undefined

    await expect(wrapper.vm.createCoil()).rejects.toThrow('Fill all required fields')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.coilMaterial.value).toBe(true)
    expect(wrapper.vm.errors.coilColor.value).toBe(true)
    expect(wrapper.vm.errors.coilLength.value).toBe(true)

    expect(coilsService.postData).not.toHaveBeenCalled()
  })

  it('Проверяет создание катушки', async () => {
    wrapper.vm.fields.coilMaterial.value = 'Plastic'
    wrapper.vm.fields.coilColor.value = 'red'
    wrapper.vm.fields.coilLength.value = 100

    wrapper.vm.createCoil()
    wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.coilMaterial.value).toBe(false)
    expect(wrapper.vm.errors.coilColor.value).toBe(false)
    expect(wrapper.vm.errors.coilLength.value).toBe(false)

    expect(coilsService.postData).toHaveBeenCalled()
    expect(coilsStore.getCoilById('1')).toBeDefined()
  })
})
