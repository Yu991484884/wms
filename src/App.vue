<template>
  <div>
    <!-- ログイン状態に応じて表示を切り替える -->
    <header v-if="authStore.isAuthenticated" class="app-header">
      <div class="menu-toggle">☰</div>
      <img src="@/assets/hokuohlog.png" alt="Hokuoh Logo" class="header-logo" />
      <h1 class="header-title">倉庫管理システム</h1>
      <!-- ユーザー名を動的に表示 -->
      <div class="user-area">{{ authStore.userId }} ▼</div>
    </header>
    <div v-if="authStore.isAuthenticated" class="main-container">
      <AppSidebar />
      <router-view class="view" />
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from "@/components/menu/AppSidebar.vue";
import { useAuthStore } from "@/stores/auth"; // ストアをインポート

const authStore = useAuthStore(); // ストアのインスタンス
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ヘッダー全体のスタイル */
.app-header {
  display: flex;
  align-items: center;
  background-color: #33b48d; /* 現在のヘッダー背景色 */
  color: #f7fafa; /* テキストの色 */
  padding: 0 20px;
  position: relative;
  height: 60px; /* ヘッダーの高さ */
}

/* メニューアイコン */
.menu-toggle {
  font-size: 24px;
  cursor: pointer;
  margin-right: 10px; /* ロゴとの間隔 */
}

/* ロゴ画像のスタイル */
.header-logo {
  height: 40px; /* ロゴの高さを調整 */
  margin-right: 10px; /* タイトルとの間隔を調整 */
}

/* タイトル */
.header-title {
  font-size: 1.5rem;
  flex-grow: 1; /* 空白部分を埋める */
}

/* ユーザーエリア */
.user-area {
  margin-left: auto; /* 右端に揃える */
  cursor: pointer;
}

/* 面接屑ナビゲーション */
.breadcrumb-container {
  background-color: #f5f5f5;
  padding: 10px 20px;
  border-bottom: 1px solid #ebebeb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* メインコンテンツエリア */
.main-container {
  display: flex;
  flex: 1;
}

.view {
  width: 100%;
  max-width: 1900px;
  border: 1px solid #ebebeb;
  margin: 20px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>
