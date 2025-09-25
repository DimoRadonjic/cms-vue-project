<script setup lang="ts">
interface Props {
  clickEvent?: (payload: MouseEvent) => void;
  label: string;
  disabled?: boolean;
  type: "button" | "reset" | "button" | "submit";
  buttonClass?: string;
  rootClass?: string;
  customIcon?: boolean;
}

defineProps<Props>();

const baseClass =
  "w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:!cursor-not-allowed enabled:hover:!cursor-pointer";
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
    <div
      v-if="customIcon"
      class="flex place-content-between gap-2 place-items-center"
    >
      <slot name="icon"></slot>
      {{ label }}
    </div>
  </Button>
</template>

<style scoped></style>
