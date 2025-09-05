<script setup lang="ts">
interface Props {
  clickEvent?: (payload: MouseEvent) => void;
  label: string;
  disabled?: boolean;
  type?: "submit" | "reset" | "button" | undefined;
}

defineProps<Props>();
</script>

<template>
  <Button
    :type
    @click="clickEvent"
    :label
    pt:root="!text-2xl"
    class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
    :disabled
  />
</template>

<style scoped></style>
