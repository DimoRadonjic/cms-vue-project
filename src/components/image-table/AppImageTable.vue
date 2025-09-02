<script setup lang="ts">
import { ref } from "vue";
import type { ImageItem } from "../../types/types";
import AppTablePagination from "../AppTablePagination.vue";

defineProps<{
  data: ImageItem[];
  loading: Boolean;
  onRefetch?: () => void;
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
    <AppSimpleTableHeader
      :itemSelected="imagesSelected"
      title="Gallery"
      @refetch="onRefetch"
    />
    <div
      :class="
        'grid  w-full  gap-7 place-content-center place-items-start ' +
        (data.length
          ? ' grid-cols-1 md:grid-cols-4 px-6 md:px-4'
          : ' grid-cols-1')
      "
    >
      <template v-if="loading">
        <div
          class="flex place-content-center place-items-center w-full h-full text-3xl"
        >
          <ProgressSpinner
            style="width: 80px; height: 80px"
            strokeWidth="8"
            fill="transparent"
            animationDuration=".5s"
            aria-label="Custom ProgressSpinner"
          />
        </div>
      </template>
      <template v-if="!data.length && !loading">
        <div
          class="flex flex-col items-center justify-center p-10 text-primary border-2 border-dashed border-primary rounded-lg bg-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mb-3 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-lg font-medium">No images uploaded</p>
          <p class="text-sm text-secondary">
            Upload your first file to get started
          </p>
        </div>
      </template>

      <template v-if="data.length">
        <div class="w-full h-full" v-for="image in data" :key="image.id">
          <AppImageCard
            :addSelectedImage="addSelectedImage"
            :image="image"
            :imagesSelected
          />
        </div>
      </template>
    </div>
    <AppTablePagination />
  </div>
</template>
