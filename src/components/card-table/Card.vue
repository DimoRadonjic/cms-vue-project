<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { DocumentItem, ImageItem, Item } from "../../types/types";
import apiImages from "../../axios/api/images";
import { useToastService } from "../../composable/toastService/AppToastService";
import apiDocuments from "../../axios/api/documents";

type CardProps = {
  type: "image" | "document";
  item: Item;
  itemsSelected: Item[];
  addSelectedItem: (item: Item) => void;
};

const props = defineProps<CardProps>();

const { navigateTo } = useAppRouter();
const { showError, showSuccess } = useToastService();

const emit = defineEmits(["refetch"]);

const itemHovered = ref();
const rename = ref<boolean>(false);
const newTitle = ref<string>(props.item.title);

const onMouseOver = (id: string) => {
  if (rename) {
    itemHovered.value = itemHovered.value;
  }
  itemHovered.value = id;
};

const renameImage = async (image: ImageItem) => {
  const { post_ids, ...rest } = image;

  try {
    await apiImages.updateImageAPI({
      ...rest,
      title: newTitle.value,
    });

    emit("refetch", true);
    showSuccess("Image updated");
    rename.value = false;
  } catch (error: any) {
    showError("Image update failed", error.message);
    throw new Error(error.message);
  }
};

const renameDocument = async (document: DocumentItem) => {
  try {
    await apiDocuments.updateDocumentAPI({
      ...document,
      title: newTitle.value,
    });

    emit("refetch", true);
    showSuccess("Image updated");
    rename.value = false;
  } catch (error: any) {
    showError("Image update failed", error.message);
    throw new Error(error.message);
  }
};

const renameItem = async () => {
  if (newTitle.value !== "" && newTitle.value === props.item.title) {
    return;
  }

  if (props.type === "image") {
    await renameImage(props.item as ImageItem);
    return;
  } else {
    await renameDocument(props.item as DocumentItem);
    return;
  }
};

const imageUrl = computed(() =>
  props.type === "document" ? props.item.preview_img : props.item.url
);

const handleNavigation = () =>
  props.type === "document"
    ? navigateTo("document-view", { id: props.item.id })
    : "";
</script>

<template>
  <div
    class="flex flex-col h-fit gap-6 rounded-xl overflow-hidden pb-4 text-center bg-primary shadow-md cursor-pointer"
    @mouseenter="onMouseOver(item.id)"
    @mouseleave="onMouseOver('')"
  >
    <div class="relative" @click.stop="addSelectedItem(item)">
      <img
        :src="imageUrl"
        class="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div class="absolute top-3 right-3">
        <input
          type="checkbox"
          class="w-5 h-5 accent-primary rounded-md cursor-pointer"
          :checked="itemsSelected.includes(item)"
          @click.stop="addSelectedItem(item)"
        />
      </div>
    </div>
    <div class="flex flex-col gap-3 transition-all duration-300 px-4">
      <AppInputTextField
        v-if="rename"
        placeholder="post title"
        fieldName="title"
        :initialValue="newTitle"
        v-model="newTitle"
        type="text"
        class="min-w-full max-w-3xl"
      />
      <h2 class="line-clamp-2" v-else>
        {{ item.title }}
      </h2>
      <TransitionGroup name="fade-slide" v-if="!rename">
        <Button
          v-if="itemHovered == item.id"
          label="Rename"
          class="transition-all duration-300"
          @click.stop="rename = true"
        />

        <Button
          v-if="itemHovered == item.id"
          label="View"
          @click="handleNavigation"
          class="transition-all duration-300"
        />
      </TransitionGroup>

      <Button v-else label="Done" @click.stop="renameItem"></Button>
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
