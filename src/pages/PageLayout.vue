<script setup lang="ts"></script>

<template>
  <div class="w-full h-full py-11 relative">
    <Transition name="fade" mode="out-in">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
