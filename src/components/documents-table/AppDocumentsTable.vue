<script setup lang="ts">
import { ref } from "vue";

interface DocumentItem {
  id: string;
  title: string;
  url: string;
}

const props = defineProps<{
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
    <div
      class="flex w-full place-items-center place-content-center gap-6 relative"
    >
      <h1 class="text-4xl font-bold">Documents</h1>
      <p class="text-2xl font-bold absolute bottom-0 right-0">
        Documnets Selected : <span>{{ documentsSelected.length }}</span>
        <FileUpload
          mode="basic"
          accept="image/*"
          :maxFileSize="1000000"
          label="Import"
          customUpload
          chooseLabel="Import"
          class="mr-2"
          auto
          :chooseButtonProps="{ severity: 'secondary' }"
        />
      </p>
    </div>
    <div class="grid grid-cols-4 gap-7 place-content-center">
      <div v-for="document in data" :key="document.id">
        <div
          class="flex flex-col gap-6 rounded-xl overflow-hidden pb-3 text-center bg-primary"
          @click="addSelectedDocument(document)"
        >
          <div class="relative">
            <iframe
              :src="document.url"
              style="width: 100%; height: 100%"
              frameborder="0"
            ></iframe>

            <div class="absolute top-0 right-4 scale-150">
              <input
                type="checkbox"
                name=""
                id=""
                :checked="documentsSelected.includes(document)"
              />
            </div>
          </div>
          <div>
            {{ document.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
