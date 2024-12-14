import { ref } from 'vue'

export function useModeSwitcher() {
  const activeModes = ref<Record<string, boolean>>({})
  const toggleMode = (mode: string) => {
    activeModes.value[mode] = !activeModes.value[mode]
  }
  const isModeActive = (mode: string) => activeModes.value[mode] || false

  return { toggleMode, isModeActive }
}
