<script setup lang="ts">
import CardTable from "../components/card-table/CardTable.vue";
import { useGallery } from "../composable/gallery/useGallery";

const { data, loading, reFetch, uploadImages, deleteImages } = useGallery();
</script>

<template>
  <div class="w-full h-full">
    <div class="flex flex-wrap gap-4 place-items-start">
      <CardTable
        type="image"
        v-model:data="data"
        v-model:loading="loading"
        title="Gallery"
        accept="image/jpeg"
        :upload="uploadImages"
        :delete="deleteImages"
        :onRefetch="reFetch"
      />
    </div>
  </div>
</template>
