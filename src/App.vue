<script setup lang="ts">
import AppTopbar from "./components/topbar/AppTopbar.vue";
</script>

<template>
  <Toast />
  <div class="flex place-content-start flex-col place-items-center h-full">
    <AppTopbar />
    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        class="flex place-content-center place-items-center h-full"
      />
    </router-view>
  </div>
</template>
