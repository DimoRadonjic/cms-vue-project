<script setup lang="ts">
interface Props {
  clickEvent?: (event?: MouseEvent) => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}

defineProps<Props>();
</script>

<template>
  <Button
    :label="label ? label : ''"
    icon="pi pi-trash"
    severity="danger"
    :disabled="disabled ? true : false"
    @click="clickEvent"
    class="disabled:hover:!cursor-not-allowed enabled:hover:!cursor-pointer"
  />
</template>

<style scoped></style>
