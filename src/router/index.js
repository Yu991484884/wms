import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";


const routes = [
  {
    path: "/",
    redirect: "/login", // デフォルトはログインページへリダイレクト
    meta: { breadcrumb: [{ label: "ホーム", path: "/" }] },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/login/LoginView.vue"),
    meta: { breadcrumb: [{ label: "ログイン", path: "/login" }] },
  },
  {
    path: "/ryukostatus",
    name: "RyukoStatus",
    component: () => import("../components/menu/ryukosubmenu/RyukoStatus.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "入庫進捗", path: "/ryukostatus" },
      ],
    },
  },
  {
    path: "/ryukoschedule",
    name: "RyukoSchedule",
    component: () => import("../components/menu/ryukosubmenu/RyukoSchedule.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "入庫予定登録", path: "/ryukoschedule" },
      ],
    },
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
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "入庫確定", path: "/ryukoconfirm" },
      ],
    },
  },
  {
    path: "/ryukoachievements",
    name: "RyukoAchievements",
    component: () => import("../components/menu/ryukosubmenu/RyukoAchievements.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "入庫実績", path: "/ryukoachievements" },
      ],
    },
  },
  {
    path: "/syukostatus",
    name: "SyukoStatus",
    component: () => import("../components/menu/syukosubmenu/SyukoStatus.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "出庫進捗", path: "/syukostatus" },
      ],
    },
  },
  {
    path: "/syukoschedule",
    name: "SyukoSchedule",
    component: () => import("../components/menu/syukosubmenu/SyukoSchedule.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "出庫予定", path: "/syukoschedule" },
      ],
    },
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
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "グロス帳票印刷", path: "/syukogurosu" },
      ],
    },
  },
  {
    path: "/syukoconfirm",
    name: "SyukoConfirm",
    component: () => import("../components/menu/syukosubmenu/SyukoConfirm.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "出庫確定", path: "/syukoconfirm" },
      ],
    },
  },
  {
    path: "/syukoachievements",
    name: "SyukoAchievements",
    component: () => import("../components/menu/syukosubmenu/SyukoAchievements.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "出庫実績", path: "/syukoachievements" },
      ],
    },
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
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "在庫移動登録", path: "/location" },
      ],
    },
  },
  {
    path: "/locationprogress",
    name: "LocationProgress",
    component: () => import("../components/menu/stocksubmenu/LocationProgress.vue"),
    meta: {
      breadcrumb: [
        { label: "ホーム", path: "/" },
        { label: "在庫移動進捗", path: "/locationprogress" },
      ],
    },
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
  const isAuthenticated = authStore.isAuthenticated;

  // ログインページへのアクセスは常に許可
  if (to.path !== "/login" && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }

  // ログインしていない場合はログインページへリダイレクト
  if (!authStore.isAuthenticated) {
    next("/login");
  } else {
    next(); // ログイン済みの場合はそのまま進む
  }
});

export default router;
