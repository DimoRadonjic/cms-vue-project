<script setup lang="ts">
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  images: ImageItem[];
}

defineProps<Props>();

const imageModal = defineModel<boolean>("imageModal", { default: false });
const existingImages = defineModel<ImageItem[]>("existingImages", {
  default: [],
});

const contains = (image: ImageItem) => {
  const inImages = existingImages.value.find(
    ({ title }) => image.title === title
  );
  if (inImages) return true;
  return false;
};

const close = () => {
  imageModal.value = false;
};

const AddImage = (image: ImageItem) => {
  if (contains(image)) return;

  existingImages.value = [...existingImages.value, image];
};
</script>

<template>
  <ModalBase v-model:modalOpen="imageModal">
    <template #body>
      <div class="bg-primary h-fit w-fit rounded-xl p-6 space-y-4">
        <h2 class="text-2xl font-semibold">Choose Images</h2>
        <div
          v-for="image in images"
          class="flex gap-5 place-content-start place-items-center text-xl"
          :key="image.id"
        >
          <ImageLink :image />
          <AppButton
            type="button"
            label="Add"
            rootClass="!text-lg !p-2"
            :clickEvent="() => AddImage(image)"
          ></AppButton>
        </div>

        <AppButton
          type="button"
          label="Cancel"
          rootClass="!text-lg !p-2"
          :clickEvent="close"
        ></AppButton>
      </div>
    </template>
  </ModalBase>
</template>
