<script setup lang="ts">
import type { ImageItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  image?: ImageItem;
}

defineProps<Props>();

const imageModal = defineModel<boolean>("imageModal");

const close = () => {
  imageModal.value = false;
};
</script>

<template>
  <ModalBase v-model:modalOpen="imageModal">
    <template #body>
      <div class="h-[90%] relative">
        <Button
          icon="pi pi-times"
          @click.stop="close"
          class="!absolute !-right-12"
        />
        <img v-if="image" :src="image.url" :alt="image.alt" class="h-full" />
      </div>
    </template>
  </ModalBase>
</template>
