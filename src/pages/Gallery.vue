<script setup lang="ts">
import { useGallery } from "../composable/gallery/useGallery";

const { data } = useGallery();

// const columns = ["id", "title", "description", "createdAt"];
</script>
<template>
  <div class="w-full">
    <div class="flex flex-wrap p-4 gap-4 place-items-start">
      <!-- <AppDataTable
        :data="data"
        :loading
        :columns
        :error
        title="Documents"
        :onRefetch="() => console.log('Refetching data...')"
      /> -->
      <AppImageTable :data />
    </div>
  </div>
</template>
