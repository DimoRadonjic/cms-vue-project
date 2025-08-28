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
    class="flex flex-col h-[300px] gap-6 rounded-xl overflow-hidden pb-3 text-center bg-primary"
    @mouseenter="onMouseOver(Number(document.id))"
    @mouseleave="onMouseOver(-1)"
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
          @click="
            $event.stopPropagation();
            addSelectedDocument(document);
          "
        />
      </div>
    </div>
    <div class="flex flex-col gap-4 px-4">
      <p>
        {{ document.title ?? "test" }}
      </p>

      <Button
        v-if="itemHovered == Number(document.id)"
        label="View"
        @click="navigateTo('document-view', { id: document.id })"
      ></Button>
    </div>
  </div>
</template>

<style scoped></style>
