<template>
  <div
    class="flex flex-col gap-6 bg-primary rounded-xl overflow-hidden pb-3 text-center"
    @click="addSelectedImage(image)"
  >
    <div class="relative">
      <img
        :src="image.url"
        style="width: 100%; height: 100%"
        class=""
        :alt="image.alt"
      />

      <div class="absolute top-0 right-4 scale-150">
        <input
          type="checkbox"
          name=""
          id=""
          :checked="imagesSelected.includes(image)"
        />
      </div>
    </div>
    <div>
      {{ image.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from "../../types/types";

defineProps<{
  image: ImageItem;
  imagesSelected: ImageItem[];
  addSelectedImage: (image: ImageItem) => void;
}>();
</script>

<style scoped></style>
