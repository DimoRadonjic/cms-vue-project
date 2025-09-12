<script setup lang="ts">
import { nextTick } from "vue";
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

const imagesModal = defineModel<boolean>("imagesModal", { default: false });
const existingImages = defineModel<ImageItem[]>("existingImages", {
  default: [],
});
const removedImages = defineModel<ImageItem[]>("removedImages", {
  default: [],
});

const availableImages = defineModel<ImageItem[]>("availableImages", {
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
  imagesModal.value = false;
};

const AddImage = async (image: ImageItem) => {
  if (contains(image)) return;

  if (removedImages.value.includes(image)) {
    removedImages.value = removedImages.value.filter(
      ({ id }) => id !== image.id
    );
  }

  const newAvaiableImages = availableImages.value.filter(
    ({ id }) => id !== image.id
  );

  availableImages.value = newAvaiableImages;

  existingImages.value = [...existingImages.value, image];

  await nextTick();

  if (newAvaiableImages.length === 0) imagesModal.value = false;
};
</script>

<template>
  <ModalBase v-model:modalOpen="imagesModal" :modalTitle="'Choose Images'">
    <template #body>
      <div class="bg-primary h-fit w-fit rounded-xl space-y-4">
        <div
          v-for="image in availableImages"
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
