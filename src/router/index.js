import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login", // デフォルトはログインページへリダイレクト
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/login/LoginView.vue"),
  },
  {
    path: "/ryukostatus",
    name: "RyukoStatus",
    component: () => import("../components/menu/ryukosubmenu/RyukoStatus.vue"),
  },
  {
    path: "/ryukoschedule",
    name: "RyukoSchedule",
    component: () => import("../components/menu/ryukosubmenu/RyukoSchedule.vue"),
  },
  {
    path: "/ryukono",
    name: "RyukoNo",
    component: () => import("../components/menu/ryukosubmenu/RyukoNo.vue"),
  },
  {
    path: "/ryukoseal",
    name: "RyukoSeal",
    component: () => import("../components/menu/ryukosubmenu/RyukoSeal.vue"),
  },
  {
    path: "/ryukoconfirm",
    name: "RyukoConfirm",
    component: () => import("../components/menu/ryukosubmenu/RyukoConfirm.vue"),
  },
  {
    path: "/ryukoachievements",
    name: "RyukoAchievements",
    component: () => import("../components/menu/ryukosubmenu/RyukoAchievements.vue"),
  },
  {
    path: "/syukostatus",
    name: "SyukoStatus",
    component: () => import("../components/menu/syukosubmenu/SyukoStatus.vue"),
  },
  {
    path: "/syukoschedule",
    name: "SyukoSchedule",
    component: () => import("../components/menu/syukosubmenu/SyukoSchedule.vue"),
  },
  {
    path: "/syukohikiate",
    name: "SyukoHikiate",
    component: () => import("../components/menu/syukosubmenu/SyukoHikiate.vue"),
  },
  {
    path: "/syukogurosu",
    name: "SyukoGurosu",
    component: () => import("../components/menu/syukosubmenu/SyukoGurosu.vue"),
  },
  {
    path: "/syukoconfirm",
    name: "SyukoConfirm",
    component: () => import("../components/menu/syukosubmenu/SyukoConfirm.vue"),
  },
  {
    path: "/syukoachievements",
    name: "SyukoAchievements",
    component: () => import("../components/menu/syukosubmenu/SyukoAchievements.vue"),
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

// グローバルナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // ログインページへのアクセスは常に許可
  if (to.path === "/login") {
    next();
    return;
  }

  // ログインしていない場合はログインページへリダイレクト
  if (!authStore.isAuthenticated) {
    next("/login");
  } else {
    next(); // ログイン済みの場合はそのまま進む
  }
});

export default router;
