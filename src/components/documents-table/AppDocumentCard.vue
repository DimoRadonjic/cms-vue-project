<script setup lang="ts">
import { ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { DocumentItem } from "../../types/types";
import apiDocuments from "../../axios/api/documents";
import { useToastService } from "../../composable/toastService/AppToastService";

const props = defineProps<{
  document: DocumentItem;
  documentsSelected: Array<any>;
  addSelectedDocument: (document: any) => void;
}>();

const { navigateTo } = useAppRouter();

const { showError, showSuccess } = useToastService();

const emit = defineEmits(["refetch"]);

const itemHovered = ref<number>(-1);
const rename = ref<boolean>(false);
const newTitle = ref<string>(props.document.title);

const onMouseOver = (id: number) => {
  if (rename) {
    itemHovered.value = itemHovered.value;
  }

  itemHovered.value = id;
};

const renameDocument = async () => {
  if (newTitle.value !== "" && newTitle.value === props.document.title) {
    return;
  }
  try {
    await apiDocuments.updateDocumentAPI({
      ...props.document,
      title: newTitle.value,
    });

    emit("refetch", true);

    showSuccess("Document updated");
    rename.value = false;
  } catch (error: any) {
    showError("Document update failed", error.message);

    throw new Error(error.message);
  }
};
</script>

<template>
  <div
    class="flex flex-col h-fit max-w-lg gap-6 rounded-xl overflow-hidden pb-3 text-center bg-primary shadow-md cursor-pointer"
    @mouseenter="onMouseOver(Number(document.id))"
    @mouseleave="onMouseOver(-1)"
  >
    <div class="relative" @click.stop="addSelectedDocument(document)">
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
    <div class="flex flex-col gap-4 w-full px-4 transition-all duration-300">
      <AppInputTextField
        v-if="rename"
        placeholder="post title"
        fieldName="title"
        :initialValue="newTitle"
        v-model="newTitle"
        type="text"
        class="min-w-full max-w-3xl"
      />
      <h2 v-else class="line-clamp-2 w-full">
        {{ document.title }}
      </h2>

      <TransitionGroup name="fade-slide" v-if="!rename">
        <Button
          v-if="itemHovered == Number(document.id)"
          label="Rename"
          @click.stop="rename = true"
        ></Button>

        <Button
          v-if="itemHovered == Number(document.id)"
          label="View"
          @click="navigateTo('document-view', { id: document.id })"
        ></Button>
      </TransitionGroup>

      <Button v-else label="Done" @click.stop="renameDocument"></Button>
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
