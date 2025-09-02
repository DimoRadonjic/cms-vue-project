<script setup lang="ts">
import { ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { ImageItem } from "../../types/types";

defineProps<{
  image: ImageItem;
  imagesSelected: ImageItem[];
  addSelectedImage: (image: ImageItem) => void;
}>();

const { navigateTo } = useAppRouter();

const itemHovered = ref();

const onMouseOver = (id: string) => {
  itemHovered.value = id;
};
</script>

<template>
  <div
    class="flex flex-col h-fit gap-6 rounded-xl overflow-hidden pb-4 text-center bg-primary shadow-md cursor-pointer"
    @mouseenter="onMouseOver(image.id)"
    @mouseleave="onMouseOver('')"
    @click.stop="addSelectedImage(image)"
  >
    <div class="relative">
      <img
        :src="image.url"
        :alt="image.alt"
        class="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div class="absolute top-3 right-3">
        <input
          type="checkbox"
          class="w-5 h-5 accent-primary rounded-md cursor-pointer"
          :checked="imagesSelected.includes(image)"
          @click.stop="addSelectedImage(image)"
        />
      </div>
    </div>
    <div class="flex flex-col gap-3 transition-all duration-300 px-4">
      <h2 class="line-clamp-2">
        {{ image.title }}
      </h2>
      <TransitionGroup name="fade-slide">
        <Button
          v-if="itemHovered == image.id"
          label="Edit"
          class="transition-all duration-300"
        />

        <Button
          v-if="itemHovered == image.id"
          label="View"
          @click="navigateTo('image-view', { id: image.id })"
          class="transition-all duration-300"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}
</style>
