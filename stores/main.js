import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
  state: () => ({
    user: null,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
  },
});
