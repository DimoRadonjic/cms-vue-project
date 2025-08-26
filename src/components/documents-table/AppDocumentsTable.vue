<script setup lang="ts">
import { ref } from "vue";
import AppSimpleTableHeader from "../AppSimpleTableHeader.vue";
import AppDocumentCard from "./AppDocumentCard.vue";

interface DocumentItem {
  id: string;
  title: string;
  url: string;
}

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
      <div class="w-full" v-for="document in data" :key="document.id">
        <AppDocumentCard
          :addSelectedDocument="addSelectedDocument"
          :document="document"
          :documentsSelected="documentsSelected"
        />
      </div>
    </div>
  </div>
</template>
