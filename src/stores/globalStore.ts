import { defineStore } from 'pinia'

type Tab = 'printers' | 'coils' | 'figure-library' | 'completed-figures'

export const globalStore = defineStore('globalStore', {
  state: () => ({
    activeTab: 'printers',
  }),
  getters: {
    getTab: (state) => state.activeTab,
  },
})
