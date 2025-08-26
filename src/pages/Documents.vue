<script setup lang="ts">
import { useDocuments } from "../composable/documents/useDocuments";

const { data } = useDocuments();
</script>
<template>
  <div class="w-full">
    <div class="flex flex-wrap p-4 gap-4 place-items-start">
      <AppDocumentsTable :data />
    </div>
  </div>
</template>
