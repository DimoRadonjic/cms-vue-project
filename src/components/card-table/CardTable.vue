<script setup lang="ts">
import { ref, watch } from "vue";
import type { Data, DocumentItem, ImageItem, Item } from "../../types/types";
import AppSimpleTableHeader from "../AppSimpleTableHeader.vue";
import ModalViewImage from "../../modals/modalViewImage.vue";

type CardTableProps =
  | {
      type: "image";
      data: ImageItem[];
      accept?: string;
      loading: boolean;
      title: string;
      onRefetch?: () => void;
      upload: (
        files: File[],
        post_id: string
      ) => Promise<
        | { data: ImageItem[]; status: number }
        | { data: null; status: number }
        | undefined
      >;
      delete: (data: ImageItem[]) => Promise<void>;
    }
  | {
      type: "document";
      data: DocumentItem[];
      accept?: string;
      loading: boolean;
      title: string;
      onRefetch?: () => void;
      upload: (
        documents: File[],
        post_id: string
      ) => Promise<
        | { data: DocumentItem[]; status: number }
        | { data: null; status: number }
        | undefined
      >;
      delete: (data: DocumentItem[]) => Promise<void>;
    };

const props = defineProps<CardTableProps>();

const itemsSelected = ref<Data>([]);

const imageToView = ref<ImageItem | undefined>(undefined);

const searching = ref<boolean>(false);
const openImageModal = ref<boolean>(false);

const localData = ref<(ImageItem | DocumentItem)[]>([]);

const openedID = ref<string | null>(null);

const addSelectedItem = (item: Item) => {
  if (itemsSelected.value.includes(item)) {
    itemsSelected.value = itemsSelected.value.filter(
      (doc) => doc.id !== item.id
    );
  } else {
    itemsSelected.value = [...itemsSelected.value, item];
  }
};

watch(
  () => props.data,
  (newVal) => {
    localData.value = [...newVal];
  },
  { immediate: true }
);
</script>

<template>
  <div class="w-full h-full space-y-10">
    <AppSimpleTableHeader
      v-model:selectedItems="itemsSelected"
      v-model:headerData="localData"
      :title
      :type
      buttonAddLabel="Upload"
      :fileUpload="true"
      :accept
      v-model:searching="searching"
      :upload
      :delete
      @refetch="onRefetch"
      :fetching="loading"
    />
    <div
      :class="
        'grid  w-full  gap-7 place-content-center  ' +
        (localData.length > 0 && !loading && !searching
          ? 'grid-cols-1  md:grid-cols-4 px-6 md:px-4 place-items-start'
          : 'grid-cols-1 place-items-center')
      "
    >
      <template v-if="loading || searching">
        <div
          class="flex place-content-center place-items-center w-full h-full text-3xl"
        >
          <ProgressSpinner
            style="width: 80px; height: 80px"
            strokeWidth="8"
            fill="transparent"
            animationDuration=".5s"
            aria-label="Custom ProgressSpinner"
          />
        </div>
      </template>
      <template v-if="localData.length === 0 && !loading && !searching">
        <div
          class="flex flex-col items-center justify-center p-10 text-primary border-2 border-dashed border-primary rounded-lg bg-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mb-3 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-lg font-medium">No {{ type }}s uploaded</p>
          <p class="text-sm text-secondary">
            Upload your first file to get started
          </p>
        </div>
      </template>

      <template v-if="localData.length > 0 && !loading && !searching">
        <div class="w-full h-full" v-for="item in localData" :key="item.id">
          <Card
            :type
            :addSelectedItem="addSelectedItem"
            :item="item"
            :itemsSelected
            v-model:openedID="openedID"
            @refetch="onRefetch"
            v-model:imageToView="imageToView"
            v-model:openModal="openImageModal"
          />
        </div>
      </template>
    </div>
  </div>

  <ModalViewImage
    v-if="openImageModal"
    v-model:imageModal="openImageModal"
    :image="imageToView"
  />
</template>
