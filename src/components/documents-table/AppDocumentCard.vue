<script setup lang="ts">
defineProps<{
  document: {
    id: string;
    title: string;
    url: string;
  };
  documentsSelected: Array<any>;
  addSelectedDocument: (document: any) => void;
}>();
</script>

<template>
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
</template>

<style scoped></style>
