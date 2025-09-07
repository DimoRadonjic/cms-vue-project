<script setup lang="ts">
import type { DocumentItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  modalOpen: boolean;
  documents: DocumentItem[];
  existingDocuments: DocumentItem[];
}

const props = defineProps<Props>();

const emit = defineEmits(["update:modalOpen", "update:existingDocuments"]);

const contains = (image: DocumentItem) => {
  const inImages = props.existingDocuments.find(
    ({ title }) => image.title === title
  );
  if (inImages) return true;
  return false;
};
const close = () => {
  emit("update:modalOpen", false);
};

const AddDocument = (image: DocumentItem) => {
  if (contains(image)) return;

  emit("update:existingDocuments", [...props.existingDocuments, image]);
};
</script>

<template>
  <ModalBase :modalOpen>
    <template #body>
      <div class="bg-primary h-fit w-fit rounded-xl p-6 space-y-4">
        <h2 class="text-2xl font-semibold">Choose Documents</h2>
        <div
          v-for="document in documents"
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
