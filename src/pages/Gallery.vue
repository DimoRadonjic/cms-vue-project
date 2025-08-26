<script setup lang="ts">
import { useGallery } from "../composable/gallery/useGallery";

const { data } = useGallery();
</script>

<template>
  <div class="w-full h-full">
    <div class="flex flex-wrap gap-4 place-items-start">
      <AppImageTable :data />
    </div>
  </div>
</template>
