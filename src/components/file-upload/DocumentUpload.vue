<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { DocumentItem } from "../../types/types";
import ModalDocuments from "../../modals/modalDocuments.vue";

interface Props {
  clear?: boolean;
  postID?: string;
}

const props = defineProps<Props>();

const available = defineModel<DocumentItem[]>("available", { default: [] });
const filesUploaded = defineModel<File[]>("files", { default: [] });
const removedDocuments = defineModel<DocumentItem[]>("removedDocuments", {
  default: [],
});
const documentModal = defineModel<boolean>("documentModal", { default: false });
const existingDocuments = defineModel<DocumentItem[]>("existingDocuments", {
  default: [],
});

const documentsUploading = ref<boolean>(false);
const fileUploadRef = ref();
const documentError = ref(false);

const onUploadDocument = (event: any) => {
  const files: File[] = Array.from(event.files || []);

  if (!files || !files.length) {
    console.error("Nema fajlova u eventu (document upload):", event);
    return;
  }

  documentsUploading.value = true;

  const existingFileNames = filesUploaded.value.map((f) => f.name);
  const existingDocumentName = existingDocuments.value.map((f) => f.title);
  const newFiles = Array.from(files).filter(
    ({ name }) =>
      !existingFileNames.includes(name) && !existingDocumentName.includes(name)
  );

  if (newFiles.length > 0) {
    filesUploaded.value = [...filesUploaded.value, ...newFiles];
  }

  documentsUploading.value = false;
};

const ClearDocumentUpload = () => {
  fileUploadRef.value?.clear();
  filesUploaded.value = [];
  removedDocuments.value = [...existingDocuments.value];
  available.value = [...available.value, ...existingDocuments.value];

  existingDocuments.value = [];
  documentError.value = false;
};

const handleDeletionDocument = (document: DocumentItem) => {
  existingDocuments.value = existingDocuments.value.filter(
    ({ id }) => id !== document.id
  );

  available.value.push(document);
  removedDocuments.value.push(document);
};

const handleDeletionFile = (document: File) => {
  filesUploaded.value = filesUploaded.value.filter(
    ({ name }) => name !== document.name
  );
};
const toggleDocumentModal = () => {
  documentModal.value = !documentModal.value;
};

watchEffect(() => props.clear && ClearDocumentUpload());
</script>

<template>
  <div class="flex flex-col place-items-center gap-y-4">
    <div class="flex gap-x-5">
      <Button
        v-if="available.length > 0"
        label="Choose"
        icon="pi pi-plus"
        :disabled="documentsUploading"
        @click.stop="toggleDocumentModal"
      ></Button>
      <div class="flex gap-x-5">
        <FileUpload
          ref="fileUploadRef"
          mode="basic"
          name="documentIds[]"
          accept="application/pdf"
          :chooseLabel="
            existingDocuments.length === 0 && filesUploaded.length === 0
              ? 'New'
              : 'Add'
          "
          :multiple="true"
          :auto="true"
          @select="onUploadDocument($event)"
          customUpload
          :disabled="documentsUploading"
        />
        <Button
          v-if="existingDocuments.length || filesUploaded.length > 0"
          label="Clear"
          :disabled="documentsUploading"
          @click="ClearDocumentUpload"
        ></Button>
      </div>
    </div>

    <div
      class="flex flex-col place-items-start gap-3"
      v-if="filesUploaded.length > 0 || existingDocuments.length > 0"
    >
      <div v-for="document in filesUploaded">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionFile(document)" />

          <DocumentLink :document />
        </div>
      </div>

      <div v-for="document in existingDocuments">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete
            :clickEvent="() => handleDeletionDocument(document)"
          />

          <DocumentLink :document />
        </div>
      </div>
    </div>
    <div v-else>
      <h3>No file chosen</h3>
    </div>

    <div v-if="documentError" class="text-red-500 text-sm">
      Failed to upload documents
    </div>
  </div>

  <ModalDocuments
    v-if="documentModal"
    v-model:documentModal="documentModal"
    v-model:availableDocuments="available"
    v-model:removedDocuments="removedDocuments"
    v-model:existingDocuments="existingDocuments"
  />
</template>

<style scoped></style>
