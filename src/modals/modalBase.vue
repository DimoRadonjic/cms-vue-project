<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

interface Props {
  modalOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits(["update:modalOpen"]);

const modal = ref<any>(null);

const close = () => {
  emit("update:modalOpen", false);
};

const handleClickOutside = (event: MouseEvent) => {
  if (modal.value && !modal.value.contains(event.target)) {
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
    class="absolute top-0 left-0 bg-black/25 w-full h-full flex place-content-center place-items-center"
    @click.stop="close"
    ref="modal"
  >
    <slot name="body"></slot>
  </div>
</template>
