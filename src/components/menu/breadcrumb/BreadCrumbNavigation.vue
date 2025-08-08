<template>
  <nav class="breadcrumb">
    <ul class="breadcrumb-list">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <router-link v-if="crumb.clickable" :to="crumb.path" class="breadcrumb-link">
          {{ crumb.label }}
        </router-link>
        <span v-else class="breadcrumb-text">{{ crumb.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script>
  export default {
    props: {
      breadcrumbs: {
        type: Array,
        required: true,
      },
    },
  };
</script>

<style scoped>
  .breadcrumb {
    padding: 10px 16px;
    background-color: #d2ebe9;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
  }

  .breadcrumb-list {
    list-style: none;
    display: flex;
    gap: 8px;
    margin: 0;
    padding: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
  }

  .breadcrumb-link {
    text-decoration: none;
    color: #007bff;
  }

  .breadcrumb-link:hover {
    text-decoration: underline;
  }

  .breadcrumb-text {
    color: #555;
  }
</style>
