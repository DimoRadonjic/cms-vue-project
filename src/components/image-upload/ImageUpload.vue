<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { ImageItem } from "../../types/types";
import { useGallery } from "../../composable/gallery/useGallery";
import ImageLink from "../ImageLink.vue";
import ModalImage from "../../modals/modalImage.vue";

interface Props {
  clear?: boolean;
  postID?: string;
}

const props = defineProps<Props>();

const { getAvailableImages } = useGallery();

const imageFiles = defineModel<File[]>("files", { default: [] });
const existingImages = defineModel<ImageItem[]>("existingImages", {
  default: [],
});
const removedImages = defineModel<ImageItem[]>("removedImages", {
  default: [],
});
const available = defineModel<ImageItem[]>("available", { default: [] });
const imageModal = defineModel<boolean>("imagesModal", { default: false });

watchEffect(async () => {
  const data = await getAvailableImages(props.postID ?? "");

  if (data && data.data) {
    available.value = data.data;
  }
});
const imagesUploading = ref<boolean>(false);
const imagesError = ref(false);
const imagesUploadRef = ref();

const onUploadImages = (event: any) => {
  const files: File[] = Array.from(event.files || []);

  if (!files || !files.length) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  imagesUploading.value = true;

  const existingFileNames = imageFiles.value.map((f) => f.name);
  const existingDocumentName = existingImages.value.map((f) => f.title);
  const newFiles = Array.from(files).filter(
    ({ name }) =>
      !existingFileNames.includes(name) && !existingDocumentName.includes(name)
  );

  if (newFiles.length > 0) {
    imageFiles.value = [...imageFiles.value, ...newFiles];
  }

  imagesUploading.value = false;
};

const ClearImagesUpload = () => {
  imagesUploadRef.value?.clear();
  imageFiles.value = [];
  removedImages.value = [...existingImages.value];
  available.value = [...available.value, ...existingImages.value];

  existingImages.value = [];
  imagesError.value = false;
};

const toggleImageModal = () => {
  imageModal.value = !imageModal.value;
};

const handleDeletionImage = (image: ImageItem) => {
  const removed: ImageItem | undefined = existingImages.value.find(
    ({ id }) => id === image.id
  );

  console.log(
    "test",
    existingImages.value.filter(({ id }) => id !== image.id)
  );

  const newArr = existingImages.value.filter(({ id }) => id !== image.id);

  existingImages.value = newArr;

  removed && removedImages.value.push(removed) && available.value.push(removed);
};

const handleDeletionFile = (image: File) => {
  imageFiles.value = imageFiles.value.filter(({ name }) => name !== image.name);
};

watchEffect(() => props.clear && ClearImagesUpload());
watchEffect(() => console.log("imageModal", imageModal.value));
</script>

<template>
  <div class="flex flex-col place-items-center gap-y-4">
    <div class="flex gap-x-5">
      <Button
        v-if="available.length > 0"
        label="Choose"
        icon="pi pi-plus"
        :disabled="imagesUploading"
        @click.stop="toggleImageModal"
      ></Button>
      <div class="flex gap-x-5">
        <FileUpload
          ref="imagesUploadRef"
          mode="basic"
          name="imageIds[]"
          accept="image/jpeg"
          :chooseLabel="
            existingImages.length === 0 && imageFiles.length === 0
              ? 'New'
              : 'Add'
          "
          :multiple="true"
          :auto="true"
          @select="onUploadImages($event)"
          customUpload
          :disabled="imagesUploading"
        />
        <Button
          v-if="existingImages.length || imageFiles.length > 0"
          label="Clear"
          :disabled="imagesUploading"
          @click="ClearImagesUpload"
        ></Button>
      </div>
    </div>

    <div
      class="flex flex-col place-items-start gap-3"
      v-if="imageFiles.length > 0 || existingImages.length > 0"
    >
      <div v-for="image in imageFiles">
        <div class="flex gap-x-4 place-items-center" :key="image.name">
          <AppButtonDelete :clickEvent="() => handleDeletionFile(image)" />

          <ImageLink :image />
        </div>
      </div>

      <div v-for="image in existingImages">
        <div class="flex gap-x-4 place-items-center" :key="image.id">
          <AppButtonDelete :clickEvent="() => handleDeletionImage(image)" />

          <ImageLink :image />
        </div>
      </div>
    </div>
    <div v-else>
      <h3>No file chosen</h3>
    </div>

    <div v-if="imagesError" class="text-red-500 text-sm">
      Failed to upload Images
    </div>
  </div>

  <ModalImage
    v-if="imageModal"
    v-model:imagesModal="imageModal"
    v-model:availableImages="available"
    v-model:existingImages="existingImages"
    v-model:removedImages="removedImages"
  />
</template>
