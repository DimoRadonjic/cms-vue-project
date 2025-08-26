<script setup lang="ts">
import { ref } from "vue";
import type { ImageItem } from "../../types/types";

defineProps<{
  data: ImageItem[];
}>();

const imagesSelected = ref<Array<ImageItem>>([]);

const addSelectedImage = (image: ImageItem) => {
  if (imagesSelected.value.includes(image)) {
    imagesSelected.value = imagesSelected.value.filter(
      (doc) => doc.id !== image.id
    );
  } else {
    imagesSelected.value = [...imagesSelected.value, image];
  }
};
</script>

<template>
  <div class="w-full h-full space-y-10">
    <AppSimpleTableHeader :itemSelected="imagesSelected" title="Gallery" />
    <div
      class="grid grid-cols-1 px-6 md:px-4 w-full md:grid-cols-4 gap-7 place-content-center place-items-center"
    >
      <div class="w-full" v-for="image in data" :key="image.id">
        <AppImageCard
          :addSelectedImage="addSelectedImage"
          :image="image"
          :imagesSelected
        />
      </div>
    </div>
  </div>
</template>
