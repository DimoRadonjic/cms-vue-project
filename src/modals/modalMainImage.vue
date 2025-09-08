<script setup lang="ts">
import { ref } from "vue";
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  modalOpen: boolean;
  images: ImageItem[];
  mainImage: ImageItem | null;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:modalOpen", "update:mainImage"]);

const localMainImage = ref<ImageItem | null>(
  props.mainImage ? { ...props.mainImage } : null
);

const close = () => {
  emit("update:modalOpen", false);
};

const AddImage = (image: ImageItem) => {
  if (localMainImage.value && image.id === localMainImage.value.id) return;

  localMainImage.value = image;

  emit("update:mainImage", image);
};
</script>

<template>
  <ModalBase :modalOpen>
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
