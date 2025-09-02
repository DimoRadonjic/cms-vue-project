<script setup lang="ts">
import { ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { DocumentItem } from "../../types/types";

defineProps<{
  document: DocumentItem;
  documentsSelected: Array<any>;
  addSelectedDocument: (document: any) => void;
}>();

const { navigateTo } = useAppRouter();

const itemHovered = ref(-1);

const onMouseOver = (id: number) => {
  itemHovered.value = id;
};
</script>

<template>
  <div
    class="flex flex-col h-fit gap-6 rounded-xl overflow-hidden pb-3 text-center bg-primary shadow-md cursor-pointer"
    @mouseenter="onMouseOver(Number(document.id))"
    @mouseleave="onMouseOver(-1)"
    @click.stop="addSelectedDocument(document)"
  >
    <div class="relative">
      <iframe
        :src="document.url"
        style="width: 100%; height: 100%"
        frameborder="0"
      ></iframe>

      <div class="absolute top-0 right-4 scale-150">
        <input
          type="checkbox"
          name=""
          id=""
          :checked="documentsSelected.includes(document)"
          @click.stop="addSelectedDocument(document)"
        />
      </div>
    </div>
    <div class="flex flex-col gap-4 px-4 transition-all duration-300">
      <h2 class="line-clamp-2">
        {{ document.title }}
      </h2>

      <TransitionGroup name="fade-slide">
        <Button v-if="itemHovered == Number(document.id)" label="Edit"></Button>

        <Button
          v-if="itemHovered == Number(document.id)"
          label="View"
          @click="navigateTo('document-view', { id: document.id })"
        ></Button>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}
</style>
