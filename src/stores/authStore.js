import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    centerId: null,
  }),
  actions: {
    login(centerId) {
      this.isAuthenticated = true;
      this.centerId = centerId;
    },
    logout() {
      this.isAuthenticated = false;
      this.centerId = null;
    },
  },

  // ✅ 追加：状態を永続化
  persist: true,
});
