<script setup lang="ts">
import AppSpinner from "./AppSpinner.vue";

defineProps<{ header: string }>();
</script>

<template>
  <div
    class="mx-auto flex place-content-center place-items-center flex-col gap-12"
  >
    <h1 class="mt-4 text-lg font-medium animate-pulse">
      {{ header }}<span class="loading-dots"></span>
    </h1>

    <AppSpinner />
  </div>
</template>

<style scoped>
@keyframes dots {
  0% {
    content: "";
  }
  33% {
    content: ".";
  }
  66% {
    content: "..";
  }
  100% {
    content: "...";
  }
}

.loading-dots::after {
  display: inline-block;
  content: "";
  animation: dots 1.2s steps(3, end) infinite;
}
</style>
