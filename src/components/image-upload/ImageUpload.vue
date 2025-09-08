<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { ImageItem } from "../../types/types";
import ModalImage from "../../modals/modalImage.vue";
import { useGallery } from "../../composable/gallery/useGallery";
import ImageLink from "../ImageLink.vue";

interface Props {
  images?: ImageItem[];
  clear?: boolean;
  files: File[];
  existingImages: ImageItem[];
  postID?: string;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "update:files",
  "update:existingImages",
  "update:removedImages",
]);

const { getAvailableImages } = useGallery();

const imageFiles = ref<File[]>([]);

const existingImages = ref<ImageItem[]>(props.images ? [...props.images] : []);
const removedImages = ref<ImageItem[]>([]);

const available = ref<ImageItem[]>([]);

watchEffect(async () => {
  const data = await getAvailableImages(props.postID ?? "");

  if (data && data.data) {
    available.value = data.data;
  }

  console.log("data", data?.data);
  console.log("postID", props.postID);
});
const imagesUploading = ref<boolean>(false);
const imageModal = ref<boolean>(false);
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

  existingImages.value = existingImages.value.filter(
    ({ id }) => id !== image.id
  );

  removed && removedImages.value.push(removed);
};

const handleDeletionFile = (image: File) => {
  imageFiles.value = imageFiles.value.filter(({ name }) => name !== image.name);
};

watchEffect(() => props.clear && ClearImagesUpload());
watchEffect(() => emit("update:existingImages", existingImages.value));
watchEffect(() => emit("update:removedImages", removedImages.value));
watchEffect(() => emit("update:files", imageFiles.value));
</script>

<template>
  <div class="flex flex-col place-items-start gap-y-4">
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
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionFile(image)" />

          <ImageLink :image />
        </div>
      </div>

      <div v-for="image in existingImages">
        <div class="flex gap-x-4 place-items-center">
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
    v-model:modalOpen="imageModal"
    :images="available"
    v-model:existingImages="existingImages"
  />
</template>
