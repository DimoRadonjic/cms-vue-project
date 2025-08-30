<script setup lang="ts">
import { useGallery } from "../composable/gallery/useGallery";

const { data, loading, reFetch } = useGallery();
</script>

<template>
  <div class="w-full h-full">
    <div class="flex flex-wrap gap-4 place-items-start">
      <AppImageTable :data :loading :onRefetch="reFetch" />
    </div>
  </div>
</template>
