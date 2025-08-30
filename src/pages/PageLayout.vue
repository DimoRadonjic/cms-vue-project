<script setup lang="ts"></script>

<template>
  <div class="w-full h-full pb-11">
    <Transition name="fade" mode="out-in">
      <router-view />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
