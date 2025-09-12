<script setup lang="ts">
defineProps<{
  modalTitle?: string;
}>();
const modalOpen = defineModel("modalOpen", { default: false });
</script>

<template>
  <Dialog
    v-model:visible="modalOpen"
    modal
    :header="modalTitle"
    :style="{ width: 'fit-content', height: 'fit-content' }"
    maximizable
    pt:header="!text-2xl"
  >
    <slot name="body" class="h-full w-full"></slot>
  </Dialog>
</template>
