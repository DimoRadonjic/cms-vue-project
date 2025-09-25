<script setup lang="ts">
interface Props {
  clickEvent?: (event?: MouseEvent) => void | Promise<void>;
  label?: string;
  disabled?: boolean;
  icon?: string;
  noIcon?: boolean;
}

defineProps<Props>();

const baseClass =
  "w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:!cursor-not-allowed enabled:hover:!cursor-pointer";
</script>

<template>
  <Button
    :label="label ? label : ''"
    :icon="!noIcon ? (icon ? icon : 'pi pi-trash') : ''"
    severity="danger"
    :disabled="disabled ? true : false"
    @click="clickEvent"
    :class="baseClass"
  />
</template>

<style scoped></style>
