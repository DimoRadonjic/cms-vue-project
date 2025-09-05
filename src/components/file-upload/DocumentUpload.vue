<script setup lang="ts">
import { ref } from "vue";
import type { DocumentItem } from "../../types/types";
import { createLink } from "../forms/utils";

interface Props {
  documents?: DocumentItem[];
}

const props = defineProps<Props>();

const filesUploaded = ref<any[]>(props.documents ?? []);
const removedDocumnets = ref<DocumentItem[]>([]);

const documentsUploading = ref<boolean>(false);
const fileUploadRef = ref();
const documentError = ref(false);

const onUploadDocument = async (event: any) => {
  const files: File[] = event.files || event.target?.files || [];

  if (!files.length) {
    console.error("Nema fajlova u eventu  (document upload) :", event);
    return;
  }

  documentsUploading.value = true;

  filesUploaded.value = [...filesUploaded.value, ...files];

  documentsUploading.value = false;
};

const ClearDocumentUpload = () => {
  fileUploadRef.value?.clear();
  filesUploaded.value = [];
  documentError.value = false;
};

const handleDeletionDocument = (index: number) => {
  const removed: any[] = filesUploaded.value.splice(index, 1);

  const removedNoPostID: DocumentItem = { ...removed[0], post_id: null };

  if (removedNoPostID.id) {
    removedDocumnets.value.push(removedNoPostID);
  }
};
</script>

<template>
  <div class="flex flex-col place-items-center gap-y-4">
    <div class="flex gap-x-5">
      <FileUpload
        ref="fileUploadRef"
        mode="basic"
        name="documentIds[]"
        accept="application/pdf"
        :chooseLabel="filesUploaded.length > 0 ? 'Add' : 'Choose'"
        :multiple="true"
        :auto="true"
        @select="onUploadDocument($event)"
        customUpload
        :disabled="documentsUploading"
      />
      <Button
        v-if="filesUploaded.length > 0"
        label="Clear"
        :disabled="documentsUploading"
        @click="ClearDocumentUpload"
      ></Button>
    </div>
    <div v-if="documentError" class="text-red-500 text-sm">
      Failed to upload documents
    </div>

    <div class="flex flex-col place-items-end gap-3">
      <div
        v-if="filesUploaded.length > 0"
        v-for="(document, index) in filesUploaded"
      >
        <div
          class="flex gap-x-4 place-items-center hover:text-primary cursor-pointer"
        >
          <Button
            icon="pi pi-trash"
            severity="danger"
            @click="handleDeletionDocument(index)"
          />

          <a
            :href="createLink(document)"
            target="_blank"
            class="font-bold flex gap-x-2 place-content-center place-items-center hover:text-primary cursor-pointer"
          >
            <i class="pi pi-file-pdf"></i>

            <span class="underline-animation"> {{ document.name }}</span>
            <SquareArrowOutUpRight />
          </a>
        </div>
      </div>
    </div>

    <div v-if="filesUploaded.length === 0 && !documentsUploading">
      <h3>No file chosen</h3>
    </div>
  </div>
</template>

<style scoped></style>
