<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

const modalOpen = defineModel("modalOpen", { default: false });

const modal = ref<any>(null);
const body = ref<any>(null);

const close = () => {
  modalOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (body.value && !body.value.contains(event.target)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 z-10 bg-black/25 min-w-full min-h-full flex place-content-center place-items-center"
    @click.self="close"
    ref="modal"
  >
    <slot name="body" ref="body" class="h-full w-full"></slot>
  </div>
</template>
