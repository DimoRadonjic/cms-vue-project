<script setup lang="ts">
import { ProgressSpinner } from "primevue";
interface Props {
  animationDuration?: string;
  strokeWidth?: string;
  height?: string;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: "80px",
  width: "80px",
  animationDuration: ".5s",
  strokeWidth: "8",
});
</script>

<template>
  <ProgressSpinner
    :style="{ width: props.width, height: props.height }"
    :strokeWidth
    fill="transparent"
    :animationDuration
    aria-label="Custom ProgressSpinner"
  />
</template>
