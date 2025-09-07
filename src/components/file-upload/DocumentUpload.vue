<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import type { DocumentItem } from "../../types/types";
import ModalDocuments from "../../modals/modalDocuments.vue";
import { useDocuments } from "../../composable/documents/useDocuments";

interface Props {
  documents?: DocumentItem[];
  clear?: boolean;
  files: File[];
  existingDocuments: DocumentItem[];
  postID?: string;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:files", "update:existingDocuments"]);

const { data } = useDocuments();

const avaiable = computed(() =>
  data.value.filter((doc: DocumentItem) => doc.post_id !== props.postID)
);

const filesUploaded = ref<File[]>([]);

const existingDocuments = ref<DocumentItem[]>(
  props.documents ? [...props.documents] : []
);

const documentsUploading = ref<boolean>(false);
const documentModal = ref<boolean>(false);
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
  existingDocuments.value = [];
  documentError.value = false;
};

const handleDeletionDocument = (index: number) => {
  existingDocuments.value.splice(index, 1);
};

const handleDeletionFile = (index: number) => {
  filesUploaded.value.splice(index, 1);
};
const toggleDocumentModal = () => {
  documentModal.value = !documentModal.value;
};

watchEffect(() => props.clear && ClearDocumentUpload());

watchEffect(() => emit("update:existingDocuments", existingDocuments.value));
watchEffect(() => emit("update:files", filesUploaded.value));
</script>

<template>
  <div class="flex flex-col place-items-start gap-y-4">
    <div class="flex gap-x-5">
      <Button
        v-if="data.length > 0"
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
      <div v-for="(document, index) in filesUploaded">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionFile(index)" />

          <DocumentLink :document />
        </div>
      </div>

      <div v-for="(document, index) in existingDocuments">
        <div class="flex gap-x-4 place-items-center">
          <AppButtonDelete :clickEvent="() => handleDeletionDocument(index)" />

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
    v-model:modalOpen="documentModal"
    :documents="avaiable"
    v-model:existingDocuments="existingDocuments"
  />
</template>

<style scoped></style>
