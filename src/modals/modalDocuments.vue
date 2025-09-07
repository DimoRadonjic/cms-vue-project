<script setup lang="ts">
import type { DocumentItem } from "../types/types";
import ModalBase from "./modalBase.vue";

interface Props {
  modalOpen: boolean;
  documents: DocumentItem[];
}

defineProps<Props>();

const emit = defineEmits(["update:modalOpen"]);

const close = () => {
  emit("update:modalOpen", false);
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
          <AppButton label="Add" rootClass="!text-lg !p-2"></AppButton>
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
