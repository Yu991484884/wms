<template>
    <nav class="breadcrumb-container">
      <ol class="breadcrumb-list">
        <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
          <span v-if="!crumb.link">{{ crumb.text }}</span>
          <router-link v-else :to="crumb.link">{{ crumb.text }}</router-link>
        </li>
      </ol>
    </nav>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  import { useRoute } from "vue-router";
  
  const route = useRoute();
  const breadcrumbs = ref([]);
  
  // 动态生成面包屑
  watch(
    () => route,
    () => {
      breadcrumbs.value = generateBreadcrumb(route);
    },
    { immediate: true }
  );
  
  function generateBreadcrumb(route) {
    const pathArray = route.path.split('/').filter(Boolean);
    const crumbs = pathArray.map((segment, index) => {
      const path = '/' + pathArray.slice(0, index + 1).join('/');
      return { text: capitalize(segment), link: path };
    });
    return crumbs;
  }
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  </script>
  
  <style scoped>
  .breadcrumb-container {
    padding: 10px 20px;
    background-color: #f5f5f5;
    border-radius: 5px;
    margin-bottom: 20px;
  }
  
  .breadcrumb-list {
    list-style: none;
    display: flex;
    gap: 5px;
    margin: 0;
    padding: 0;
  }
  
  .breadcrumb-item {
    font-size: 14px;
    color: #333;
  }
  
  .breadcrumb-item a {
    text-decoration: none;
    color: #33b48d;
  }
  
  .breadcrumb-item a:hover {
    text-decoration: underline;
  }
  </style>
  