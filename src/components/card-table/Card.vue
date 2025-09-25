<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppRouter } from "../../composable/router/useAppRouter";
import type { DocumentItem, ImageItem, Item } from "../../types/types";
import apiImages from "../../axios/api/images";
import { useToastService } from "../../composable/toastService/AppToastService";
import apiDocuments from "../../axios/api/documents";
import { Eye, Pencil } from "lucide-vue-next";

type CardProps = {
  type: "image" | "document";
  item: Item;
  itemsSelected: Item[];
  addSelectedItem: (item: Item) => void;
  openedID: string | number | null;
};

const props = defineProps<CardProps>();

const { navigateTo } = useAppRouter();
const { showError, showSuccess } = useToastService();

const emit = defineEmits(["refetch"]);
const openedID = defineModel<string | number | null>("openedID", {
  default: null,
});

const imageToView = defineModel<ImageItem | undefined>("imageToView", {
  default: undefined,
});

const documentToView = ref<DocumentItem | undefined>(undefined);

const rename = ref<boolean>(false);
const newTitle = ref<string>(props.item.title);

const renameImage = async (image: ImageItem) => {
  const { post_ids, ...rest } = image;

  try {
    await apiImages.updateImageAPI({
      ...rest,
      title: newTitle.value,
    });

    emit("refetch");
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

    emit("refetch");
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

const mouseOver = (item: Item | undefined) => {
  if (!item) {
    imageToView.value = undefined;
    documentToView.value = undefined;
    return;
  }

  if (props.type === "image") {
    if (imageToView.value && imageToView.value.id === item.id) {
      imageToView.value = undefined;
      return;
    }
    if (!imageToView.value) imageToView.value = item;

    openedID.value = openedID.value === item.id ? null : item.id;
  } else {
    if (documentToView.value && documentToView.value.id === item.id) {
      documentToView.value = undefined;
      return;
    }
    if (!documentToView.value) documentToView.value = item;

    openedID.value = openedID.value === item.id ? null : item.id;
  }
};

const imageUrl = computed(() =>
  props.type === "document" ? props.item.preview_img : props.item.url
);

const handleView = () => {
  if (props.type === "document") {
    navigateTo("document-view", { id: props.item.id });
  }
};
</script>

<template>
  <div
    class="flex flex-col h-fit gap-6 rounded-xl overflow-hidden pb-4 text-center bg-primary shadow-md"
    @mouseenter="mouseOver(item)"
    @mouseleave="mouseOver(undefined)"
  >
    <div class="relative">
      <Image
        v-if="type === 'image'"
        :src="imageUrl"
        alt="Image"
        width="100%"
        imageClass="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
        :preview="type === 'image'"
        class="w-full h-full object-cover"
      />

      <div v-else class="relative">
        <Image
          :src="imageUrl"
          alt="Image"
          width="100%"
          imageClass="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
          class="w-full h-full object-cover relative z-0"
        />

        <div
          class="absolute inset-0 bg-black opacity-60 flex place-content-center place-items-center hover:cursor-pointer z-10"
          @click.stop="handleView"
          v-if="
            (imageToView && imageToView.id === item.id) ||
            (documentToView && documentToView.id === item.id)
          "
        >
          <Eye />
        </div>
      </div>

      <div class="absolute top-3 right-3 z-20">
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
      <div v-else class="flex place-content-start gap-x-3 place-items-center">
        <h2 class="line-clamp-2">
          {{ item.title }}
        </h2>

        <Pencil
          @click.stop="rename = true"
          v-if="
            (imageToView && imageToView.id === item.id) ||
            (documentToView && documentToView.id === item.id)
          "
          class="hover:cursor-pointer"
        />
      </div>

      <div v-if="rename" class="flex flex-col gap-y-4">
        <Button label="Done" @click.stop="renameItem"></Button>
        <Button label="Cancel" @click.stop="rename = false"></Button>
      </div>
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
