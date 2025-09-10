<script setup lang="ts">
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  images: ImageItem[];
  mainImage: ImageItem | null | undefined;
}

defineProps<Props>();

const mainImageModal = defineModel<boolean>("mainImageModal", {
  default: false,
});
const mainImage = defineModel<ImageItem | null>("mainImage", {
  default: null,
});

const close = () => {
  mainImageModal.value = false;
};
const AddImage = (image: ImageItem) => {
  if (mainImage.value && image.id === mainImage.value.id) return;

  mainImage.value = image;
};
</script>

<template>
  <ModalBase v-model:modalOpen="mainImageModal">
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
