import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true", // ローカルストレージから初期状態を取得
  }),
  actions: {
    login() {
      this.isAuthenticated = true; // 認証状態を`true`に設定
      localStorage.setItem("isAuthenticated", true); // ローカルストレージに保存
    },
    logout() {
      this.isAuthenticated = false; // 認証状態を`false`に設定
      localStorage.removeItem("isAuthenticated"); // ローカルストレージから削除
    },
  },
});
