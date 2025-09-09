<script setup lang="ts">
interface Props {
  clickEvent?: (payload: MouseEvent) => void;
  label: string;
  disabled?: boolean;
  type: "button" | "reset" | "button" | "submit";
  buttonClass?: string;
  rootClass?: string;
}

defineProps<Props>();

const baseClass =
  "w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95";
</script>

<template>
  <Button
    :type="type ? type : 'button'"
    @click="clickEvent"
    :label
    :pt:root="!rootClass ? '!text-2xl' : rootClass + ' ' + '!text-2xl'"
    :class="!buttonClass ? baseClass : baseClass + ' ' + buttonClass"
    :disabled
  >
  </Button>
</template>

<style scoped></style>
