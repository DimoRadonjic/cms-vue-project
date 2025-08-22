<script setup lang="ts">
import { ref } from "vue";

interface ImageItem {
  id: string;
  title: string;
  url: string;
  alt: string;
}

const props = defineProps<{
  data: ImageItem[];
}>();

const imagesSelected = ref<Array<ImageItem>>([]);

const addSelectedImage = (document: ImageItem) => {
  if (imagesSelected.value.includes(document)) {
    imagesSelected.value = imagesSelected.value.filter(
      (doc) => doc.id !== document.id
    );
  } else {
    imagesSelected.value = [...imagesSelected.value, document];
  }
};
</script>

<template>
  <div class="w-full space-y-10">
    <div
      class="flex w-full place-items-center place-content-center gap-6 relative"
    >
      <h1 class="text-4xl font-bold">Gallery</h1>
      <p class="text-2xl font-bold absolute bottom-0 right-0">
        Images Selected : <span>{{ imagesSelected.length }}</span>
      </p>
    </div>
    <div class="grid grid-cols-4 gap-7 place-content-center">
      <div v-for="image in data" :key="image.id">
        <div
          class="flex flex-col gap-6 bg-primary rounded-xl overflow-hidden pb-3 text-center"
          @click="addSelectedImage(image)"
        >
          <div class="relative">
            <img
              :src="image.url"
              style="width: 100%; height: 100%"
              class="w-full h-full min-w-[200px] min-h-[200px]"
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
      </div>
    </div>
  </div>
</template>
