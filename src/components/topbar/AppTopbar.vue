<script setup lang="ts">
import { useAuth, useTheme } from "../../composable";

const { theme, switchTheme } = useTheme();
const { isAuth } = useAuth();
</script>

<template>
  <nav class="fixed top-0 w-full z-10">
    <div class="flex place-content-between w-full my-2 mx-1">
      <AppSidebar v-if="isAuth" />
      <div class="ml-auto">
        <button @click="switchTheme" class="relative w-16 h-16">
          <transition name="icon-fade" mode="out-in">
            <i
              v-if="!theme"
              key="sun"
              class="pi pi-sun sun-icon"
              style="font-size: 2rem"
            ></i>
            <i
              v-else
              key="moon"
              class="pi pi-moon moon-icon"
              style="font-size: 2rem"
            ></i>
          </transition>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease-in-out;
  transform-origin: center;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0);
}
.icon-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}

.icon-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

.sun-icon {
  color: #facc15;
}

.moon-icon {
  color: #60a5fa;
}
</style>
