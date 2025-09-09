<script setup lang="ts">
import { ref } from "vue";
import type { Data, DocumentItem, ImageItem, Item } from "../../types/types";
import AppSimpleTableHeader from "../AppSimpleTableHeader.vue";

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

defineProps<CardTableProps>();

const itemsSelected = ref<Data>([]);

const addSelectedItem = (item: Item) => {
  if (itemsSelected.value.includes(item)) {
    itemsSelected.value = itemsSelected.value.filter(
      (doc) => doc.id !== item.id
    );
  } else {
    itemsSelected.value = [...itemsSelected.value, item];
  }
};
</script>

<template>
  <div class="w-full h-full space-y-10">
    <AppSimpleTableHeader
      v-model:selectedItem="itemsSelected"
      :title
      buttonAddLabel="Upload"
      :fileUpload="true"
      :accept
      :upload
      :delete
      @refetch="onRefetch"
      :fetching="loading"
    />
    <div
      :class="
        'grid  w-full  gap-7 place-content-center  ' +
        (data.length && !loading
          ? 'grid-cols-1  md:grid-cols-4 px-6 md:px-4 place-items-start'
          : 'grid-cols-1 place-items-center')
      "
    >
      <template v-if="loading">
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
      <template v-if="!data.length && !loading">
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
          <p class="text-lg font-medium">No images uploaded</p>
          <p class="text-sm text-secondary">
            Upload your first file to get started
          </p>
        </div>
      </template>

      <template v-if="data.length && !loading">
        <div class="w-full h-full" v-for="image in data" :key="image.id">
          <Card
            :type
            :addSelectedItem="addSelectedItem"
            :item="image"
            :itemsSelected
            @refetch="onRefetch"
          />
        </div>
      </template>
    </div>
  </div>
</template>
