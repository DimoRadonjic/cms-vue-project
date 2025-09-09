<script setup lang="ts">
import { ref } from "vue";
import type { DocumentItem } from "../../types/types";

defineProps<{
  data: DocumentItem[];
  loading: Boolean;
  onRefetch?: () => Promise<void>;
  upload: () => Promise<void>;
  delete: () => Promise<void>;
}>();

const documentsSelected = ref<Array<any>>([]);
const localModelOpen = ref<boolean>(false);

const addSelectedDocument = (document: any) => {
  if (documentsSelected.value.includes(document)) {
    documentsSelected.value = documentsSelected.value.filter(
      (doc) => doc.id !== document.id
    );
  } else {
    documentsSelected.value = [...documentsSelected.value, document];
  }
};
</script>

<template>
  <div class="w-full space-y-10">
    <AppSimpleTableHeader
      v-model:selectedItem="documentsSelected"
      title="Documents"
      buttonAddLabel="Upload"
      :fileUpload="true"
      :accept="'application/pdf'"
      :upload
      :delete
      v-model:openModal="localModelOpen"
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
          <p class="text-lg font-medium">No documents uploaded</p>
          <p class="text-sm text-secondary">
            Upload your first file to get started
          </p>
        </div>
      </template>

      <template v-if="data.length && !loading">
        <div
          class="w-full"
          v-for="singleDocument in data"
          :key="singleDocument.id"
        >
          <AppDocumentCard
            :addSelectedDocument="addSelectedDocument"
            :document="singleDocument"
            :documentsSelected="documentsSelected"
            @refetch="onRefetch"
          />
        </div>
      </template>
    </div>
  </div>
</template>
