<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { ImageItem } from "../../types/types";
import ModalImage from "../../modals/modalImage.vue";
import { useGallery } from "../../composable/gallery/useGallery";

interface Props {
  images?: ImageItem[];
  clear?: boolean;
  files?: File[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:files"]);

const { data } = useGallery();

const imageFiles = ref<File[]>([]);

const existingImages = ref<ImageItem[]>(props.images ? [...props.images] : []);

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

  // imagesUploading.value = true;

  const existingFileNames = imageFiles.value.map((f) => f.name);
  const existingDocumentName = existingImages.value.map((f) => f.title);
  const newFiles = Array.from(files).filter(
    ({ name }) =>
      !existingFileNames.includes(name) && !existingDocumentName.includes(name)
  );

  if (newFiles.length > 0) {
    imageFiles.value = [...imageFiles.value, ...newFiles];
  }

  // imagesUploading.value = false;

  emit("update:files", imageFiles.value);
};

const ClearImagesUpload = () => {
  imagesUploadRef.value?.clear();
  imageFiles.value = [];
  imagesError.value = false;
};

const toggleImageModal = () => {
  imageModal.value = !imageModal.value;
};

const handleDeletionImage = (index: number) => {
  existingImages.value.splice(index, 1);
};

const handleDeletionFile = (index: number) => {
  imageFiles.value.splice(index, 1);
};

watchEffect(() => props.clear && ClearImagesUpload());
</script>

<template>
  <div class="flex flex-col place-items-start gap-y-4">
    <div class="flex gap-x-5">
      <Button
        v-if="data.length > 0"
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
      <div v-for="(document, index) in imageFiles">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionImage(index)" />

          <DocumentLink :document />
        </div>
      </div>

      <div v-for="(document, index) in existingImages">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionFile(index)" />

          <DocumentLink :document />
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
  <ModalImage v-if="imageModal" v-model:modalOpen="imageModal" :images="data" />
</template>
