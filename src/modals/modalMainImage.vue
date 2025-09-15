<script setup lang="ts">
import { ref } from "vue";
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  mainImage: ImageItem | null | undefined;
}

defineProps<Props>();

const mainImageModal = defineModel<boolean>("mainImageModal", {
  default: false,
});

const mainImage = defineModel<ImageItem | null>("mainImage", {
  default: null,
});

const originalImage = ref<ImageItem | null>(
  mainImage.value && { ...mainImage.value }
);

const availableImages = defineModel<ImageItem[]>("availableImages", {
  default: [],
});

const close = () => {
  mainImageModal.value = false;
};
const AddImage = async (image: ImageItem) => {
  if (mainImage.value && image.id === mainImage.value.id) return;

  mainImage.value = image;
};

const handleDeletionImage = () => {
  mainImage.value = null;
};
</script>

<template>
  <ModalBase
    v-model:modalOpen="mainImageModal"
    :modalTitle="'Choose Main Image'"
  >
    <template #body>
      <div class="bg-primary h-fit w-fit rounded-xl space-y-4">
        <div
          v-for="image in availableImages"
          class="flex gap-5 place-content-start place-items-center text-xl"
          :key="image.id"
        >
          <span
            v-if="originalImage?.id === image?.id"
            class="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-300"
          >
            Original
          </span>
          <ImageLink :image />
          <AppButton
            v-if="mainImage?.id !== image.id"
            type="button"
            label="Add"
            rootClass="!text-lg !p-2"
            :clickEvent="() => AddImage(image)"
          ></AppButton>
          <AppButtonDelete v-else :clickEvent="() => handleDeletionImage()" />
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
