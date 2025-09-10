<script setup lang="ts">
import { nextTick } from "vue";
import type { DocumentItem } from "../types/types";
import ModalBase from "./modalBase.vue";

const documentModal = defineModel("documentModal", { default: false });
const availableDocuments = defineModel<DocumentItem[]>("availableDocuments", {
  default: [],
});
const removedDocuments = defineModel<DocumentItem[]>("removedDocuments", {
  default: [],
});
const existingDocuments = defineModel<DocumentItem[]>("existingDocuments", {
  default: [],
});

const contains = (image: DocumentItem) => {
  const inImages = existingDocuments.value.find(
    ({ title }) => image.title === title
  );
  if (inImages) return true;
  return false;
};
const close = () => {
  documentModal.value = false;
};

const AddDocument = async (document: DocumentItem) => {
  if (contains(document)) return;

  if (removedDocuments.value.includes(document)) {
    removedDocuments.value = removedDocuments.value.filter(
      ({ id }) => id !== document.id
    );
  }

  availableDocuments.value = availableDocuments.value.filter(
    ({ id }) => id !== document.id
  );

  existingDocuments.value = [...existingDocuments.value, document];

  await nextTick();

  if (availableDocuments.value.length === 0) documentModal.value = false;
};
</script>

<template>
  <ModalBase v-model:modalOpen="documentModal">
    <template #body>
      <div class="bg-primary h-fit w-fit rounded-xl p-6 space-y-4">
        <h2 class="text-2xl font-semibold">Choose Documents</h2>
        <div
          v-for="document in availableDocuments"
          class="flex gap-5 place-content-start place-items-center text-xl"
          :key="document.id"
        >
          <DocumentLink :document />
          <AppButton
            type="button"
            label="Add"
            rootClass="!text-lg !p-2"
            :clickEvent="() => AddDocument(document)"
          ></AppButton>
        </div>

        <AppButton
          type="button"
          label="Cancel"
          rootClass="!text-lg !p-2"
          :clickEvent="close"
        ></AppButton>
      </div>
    </template>
  </ModalBase>
</template>
