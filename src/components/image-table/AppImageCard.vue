<script setup lang="ts">
import { ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { ImageItem } from "../../types/types";
import apiImages from "../../axios/api/images";
import { useToastService } from "../../composable/toastService/AppToastService";

const props = defineProps<{
  image: ImageItem;
  imagesSelected: ImageItem[];
  addSelectedImage: (image: ImageItem) => void;
}>();

const { navigateTo } = useAppRouter();
const { showError, showSuccess } = useToastService();

const emit = defineEmits(["refetch"]);

const itemHovered = ref();
const rename = ref<boolean>(false);
const newTitle = ref<string>(props.image.title);

const onMouseOver = (id: string) => {
  if (rename) {
    itemHovered.value = itemHovered.value;
  }
  itemHovered.value = id;
};

const renameDocument = async () => {
  if (newTitle.value !== "" && newTitle.value === props.image.title) {
    return;
  }
  try {
    await apiImages.updateImageAPI({
      ...props.image,
      title: newTitle.value,
    });

    emit("refetch", true);
    showSuccess("Image updated");
    rename.value = false;
  } catch (error: any) {
    showError("Image update failed", error.message);
    throw new Error(error.message);
  }
};
</script>

<template>
  <div
    class="flex flex-col h-fit gap-6 rounded-xl overflow-hidden pb-4 text-center bg-primary shadow-md cursor-pointer"
    @mouseenter="onMouseOver(image.id)"
    @mouseleave="onMouseOver('')"
  >
    <div class="relative" @click.stop="addSelectedImage(image)">
      <img
        :src="image.url"
        :alt="image.alt"
        class="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div class="absolute top-3 right-3">
        <input
          type="checkbox"
          class="w-5 h-5 accent-primary rounded-md cursor-pointer"
          :checked="imagesSelected.includes(image)"
          @click.stop="addSelectedImage(image)"
        />
      </div>
    </div>
    <div class="flex flex-col gap-3 transition-all duration-300 px-4">
      <AppInputTextField
        v-if="rename"
        placeholder="post title"
        fieldName="title"
        :initialValue="newTitle"
        v-model="newTitle"
        type="text"
        class="min-w-full max-w-3xl"
      />
      <h2 class="line-clamp-2" v-else>
        {{ image.title }}
      </h2>
      <TransitionGroup name="fade-slide" v-if="!rename">
        <Button
          v-if="itemHovered == image.id"
          label="Rename"
          class="transition-all duration-300"
          @click.stop="rename = true"
        />

        <Button
          v-if="itemHovered == image.id"
          label="View"
          @click="navigateTo('image-view', { id: image.id })"
          class="transition-all duration-300"
        />
      </TransitionGroup>

      <Button v-else label="Done" @click.stop="renameDocument"></Button>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}
</style>
