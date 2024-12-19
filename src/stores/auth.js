import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false, // ログイン状態を管理
  }),
  actions: {
    login() {
      this.isAuthenticated = true; // ログイン成功時に状態を更新
    },
    logout() {
      this.isAuthenticated = false; // ログアウト時に状態をリセット
    },
  },
});