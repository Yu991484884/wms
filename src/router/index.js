import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth"; 

const routes = [
  {
    path: "/",
    redirect: "/login", // デフォルトは入庫進捗ページへリダイレクト
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/login/LoginView.vue"),
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        next("/ryukostatus"); // ログイン済みの場合リダイレクト
      } else {
        next();
      }
    },
  },
  {
    path: "/ryukostatus",
    name: "RyukoStatus",
    component: () => import("../components/menu/ryukosubmenu/RyukoStatus.vue"),
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        next("/login"); // 未ログインの場合ログインページへ
      } else {
        next();
      }
    },
  },
  {
    path: "/ryukoschedule",
    name: "RyukoSchedule",
    component: () => import("../components/menu/ryukosubmenu/RyukoSchedule.vue"), // 入庫予定
  },
  {
    path: "/ryukono",
    name: "RyukoNo",
    component: () => import("../components/menu/ryukosubmenu/RyukoNo.vue"), // 入庫看板
  },
  {
    path: "/ryukoseal",
    name: "RyukoSeal",
    component: () => import("../components/menu/ryukosubmenu/RyukoSeal.vue"), // 入庫シール発行
  },
  {
    path: "/ryukoconfirm",
    name: "RyukoConfirm",
    component: () => import("../components/menu/ryukosubmenu/RyukoConfirm.vue"), // 入庫確定
  },
  {
    path: "/ryukoachievements",
    name: "RyukoAchievements",
    component: () => import("../components/menu/ryukosubmenu/RyukoAchievements.vue"), // 入庫実績
  },
  {
    path: "/syukostatus",
    name: "SyukoStatus",
    component: () => import("../components/menu/syukosubmenu/SyukoStatus.vue"), // 出庫業務（仮）
  },
  {
    path: "/syukoschedule",
    name: "SyukoSchedule",
    component: () => import("../components/menu/syukosubmenu/SyukoSchedule.vue"), // 出庫業務（仮）
  },
  {
    path: "/syukohikiate",
    name: "SyukoHikiate",
    component: () => import("../components/menu/syukosubmenu/SyukoHikiate.vue"), // 出庫業務（仮）
  },
  {
    path: "/syukogurosu",
    name: "SyukoGurosu",
    component: () => import("../components/menu/syukosubmenu/SyukoGurosu.vue"), // 出庫業務（仮）
  },
  {
    path: "/syukoconfirm",
    name: "SyukoConfirm",
    component: () => import("../components/menu/syukosubmenu/SyukoConfirm.vue"), // 出庫業務（仮）
  },
  {
    path: "/syukoachievements",
    name: "SyukoAchievements",
    component: () => import("../components/menu/syukosubmenu/SyukoAchievements.vue"), // 出庫業務（仮）
  },
  {
    path: "/itemmaster",
    name: "ItemMaster",
    component: () => import("../components/menu/mastersubmenu/ItemMaster.vue"), 
  },
  {
    path: "/customermaster",
    name: "CustomerMaster",
    component: () => import("../components/menu/mastersubmenu/CustomerMaster.vue"), 
  },
  {
    path: "/warehousemaster",
    name: "WarehouseMaster",
    component: () => import("../components/menu/mastersubmenu/WarehouseMaster.vue"), 
  },
  {
    path: "/tastemaster",
    name: "TasteMaster",
    component: () => import("../components/menu/mastersubmenu/TasteMaster.vue"), 
  },
  {
    path: "/shopmaster",
    name: "ShopMaster",
    component: () => import("../components/menu/mastersubmenu/ShopMaster.vue"), 
  },
  {
    path: "/productionmaster",
    name: "ProductionMaster",
    component: () => import("../components/menu/mastersubmenu/ProductionMaster.vue"), 
  },
  {
    path: "/coursemaster",
    name: "CourseMaster",
    component: () => import("../components/menu/mastersubmenu/CourseMaster.vue"), 
  },
  {
    path: "/location",
    name: "LocationMove",
    component: () => import("../components/menu/stocksubmenu/LocationMove.vue"), 
  },
  {
    path: "/inventory",
    name: "InventoryMainten",
    component: () => import("../components/menu/stocksubmenu/InventoryMainten.vue"), 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
