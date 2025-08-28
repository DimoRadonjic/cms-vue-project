<script setup lang="ts">
import { ref } from "vue";
import AppSimpleTableHeader from "../AppSimpleTableHeader.vue";
import AppDocumentCard from "./AppDocumentCard.vue";
import type { DocumentItem } from "../../types/types";

defineProps<{
  data: DocumentItem[];
}>();

const documentsSelected = ref<Array<any>>([]);

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
    <AppSimpleTableHeader :itemSelected="documentsSelected" title="Documents" />
    <div
      class="grid grid-cols-1 px-6 md:px-4 w-full md:grid-cols-4 gap-7 place-content-center place-items-center"
    >
      <div
        class="w-full"
        v-for="singleDocument in data"
        :key="singleDocument.id"
      >
        <AppDocumentCard
          :addSelectedDocument="addSelectedDocument"
          :document="singleDocument"
          :documentsSelected="documentsSelected"
        />
      </div>
    </div>
  </div>
</template>
