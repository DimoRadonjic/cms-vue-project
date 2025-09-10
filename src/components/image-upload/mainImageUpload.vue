<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import type { ImageItem } from "../../types/types";
import { useGallery } from "../../composable/gallery/useGallery";
import { ImagePlus, Wallpaper } from "lucide-vue-next";
import { createLink } from "../utils";
import ModalMainImage from "../../modals/modalMainImage.vue";

interface Props {
  images?: ImageItem[];
  clear?: boolean;
  postID?: string;
}

const props = defineProps<Props>();

const { getAvailableImages } = useGallery();

const mainImageModal = defineModel<boolean>("mainImageModal", {
  default: false,
});
const mainImageUpload = defineModel<File | undefined>("mainImageUpload");
const available = defineModel<ImageItem[]>("available", { default: [] });
const mainImage = defineModel<ImageItem | null>("mainImage", { default: null });

const removed = ref<ImageItem>();

watchEffect(async () => {
  const data = await getAvailableImages(props.postID ?? "");

  if (data && data.data) {
    available.value = data.data;
  }
});
const mainImageLoading = ref<boolean>(false);
const mainImageError = ref(false);
const mainImageUploadRef = ref();

const onUploadImage = async (event: any) => {
  const files: File[] = event.files || event.target?.files;

  mainImageLoading.value = true;

  if (!files) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  mainImageUpload.value = files[0];

  mainImageLoading.value = false;
};

const ClearImageUpload = () => {
  mainImageUploadRef.value?.clear();
  mainImageUpload.value = undefined;
  mainImageError.value = false;
  if (mainImage.value) {
    removed.value = mainImage.value;
    available.value.push(mainImage.value);
  }

  mainImage.value = null;
};

const toggleImageModal = () => {
  console.log("here", !mainImageModal.value);
  mainImageModal.value = !mainImageModal.value;
};

const mainImageLink = computed<string>(() => {
  return mainImageUpload.value ? createLink(mainImageUpload.value) : "";
});

watchEffect(() => props.clear && ClearImageUpload());
</script>

<template>
  <div class="flex flex-col place-items-start gap-y-4">
    <div class="flex flex-col gap-y-4">
      <div>
        <div class="flex place-content-center place-items-center gap-x-3">
          <Wallpaper class="icon" />
          <label for="mainImageId" class="text-2xl font-bold">Main image</label>
        </div>

        <div class="h-[300px] w-fit">
          <div
            v-if="!mainImageUpload && !mainImage"
            class="mt-4 relative w-full h-full"
          >
            <ImagePlus class="w-full h-full z-10" />

            <FileUpload
              ref="mainImageUploadRef"
              mode="basic"
              class="!absolute top-0 w-full h-full !opacity-0 !z-0"
              name="mainImageId"
              accept="image/jpeg"
              @select="onUploadImage($event)"
              :auto="true"
              customUpload
              :disabled="mainImageLoading"
            />
          </div>

          <div v-else class="h-full">
            <img
              v-if="mainImage && !mainImageUpload"
              :src="mainImage.url"
              alt="main-image"
              class="w-sm object-contain h-full"
              @load="mainImageLoading = false"
              @error="
                mainImageLoading = false;
                mainImageError = true;
              "
            />

            <img
              v-else
              :src="mainImageLink"
              alt="main-image"
              class="w-sm object-contain h-full"
              @load="mainImageLoading = false"
              @error="
                mainImageLoading = false;
                mainImageError = true;
              "
            />
          </div>
        </div>

        <div v-if="mainImageError" class="text-red-500 text-sm">
          Failed to load image
        </div>
      </div>

      <div class="flex gap-x-5">
        <Button
          v-if="available.length > 0"
          label="Choose"
          icon="pi pi-plus"
          @click.stop="toggleImageModal"
        ></Button>
        <div class="flex gap-x-5">
          <FileUpload
            v-if="mainImageUpload || mainImage"
            ref="imagesUploadRef"
            mode="basic"
            name="imageIds[]"
            accept="image/jpeg"
            chooseLabel="New"
            :multiple="true"
            :auto="true"
            @select="onUploadImage($event)"
            customUpload
          />
          <Button
            v-if="mainImage || mainImageUpload"
            label="Clear"
            :disabled="mainImageLoading"
            @click="ClearImageUpload"
          ></Button>
        </div>
      </div>
    </div>

    <div v-if="mainImageError" class="text-red-500 text-sm">
      Failed to upload Images
    </div>
  </div>

  <ModalMainImage
    v-if="mainImageModal"
    v-model:mainImageModal="mainImageModal"
    v-model:availableImages="available"
    v-model:mainImage="mainImage"
  />
</template>
