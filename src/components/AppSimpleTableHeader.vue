<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import type { DocumentItem } from "../types/types";
import { useToastService } from "../composable/toastService/AppToastService";
import tableGallery from "../supabase/tables/tableGallery";
import { debounce } from "lodash";
import tableDocuments from "../supabase/tables/tableDocuments";

type BaseProps = {
  type: "image" | "document";
  title: string;
  buttonAddLabel?: string;
};

type UploadProps =
  | ({
      fileUpload: true;
      accept: string;
      upload: (file: File[]) => void;
      delete: (file: DocumentItem[]) => void;
    } & BaseProps)
  | ({
      fileUpload?: false;
      accept?: never;
      upload?: never;
      delete?: never;
    } & BaseProps);

type Props = UploadProps;

const props = withDefaults(defineProps<Props>(), {
  buttonAddLabel: "New",
  fileUpload: false,
});

const emit = defineEmits(["refetch"]);

const fetching = defineModel("fetching", { default: false });
const searching = defineModel("searching", { default: false });
const selectedItems = defineModel("selectedItems", { default: [] });
const headerData = defineModel("headerData", { default: [] });

const { showSuccess } = useToastService();

const { navigateTo } = useAppRouter();

const uploading = ref<boolean>(false);
const deleting = ref(false);
const search = ref<string>("");

const deleteLabel = computed(() => {
  return deleting.value
    ? "Deleting"
    : selectedItems.value && selectedItems.value.length > 0
    ? `Delete ${selectedItems.value.length}`
    : "No item selected";
});

const handleDeletion = async () => {
  if (!selectedItems.value) return;

  deleting.value = true;

  try {
    if (props.delete) {
      await props.delete(selectedItems.value);
    }

    showSuccess("Item deleted");
  } catch (error: any) {
    throw new Error(error.message);
  }

  selectedItems.value = [];

  emit("refetch");

  uploading.value = false;

  deleting.value = false;
};

const uploadFunc = async (event: any) => {
  const files: File[] = event.files || event.target?.files || [];

  if (files.length === 0) return;

  uploading.value = true;

  try {
    if (props.upload) {
      await props.upload(files);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }

  selectedItems.value = [];

  emit("refetch");

  uploading.value = false;
};

const handleSearch = async (search: string) => {
  searching.value = true;

  if (props.type === "image") {
    try {
      const data = await tableGallery.searchImages(search);
      selectedItems.value = [];

      headerData.value = data as any;
    } catch (error: any) {
      searching.value = false;
      throw new Error(error.message);
    }
  } else {
    try {
      const data = await tableDocuments.searchDocuments(search);
      selectedItems.value = [];

      headerData.value = data as any;
    } catch (error: any) {
      searching.value = false;
      throw new Error(error.message);
    }
  }

  searching.value = false;
};

const debouncedSearch = debounce(async (search: string) => {
  searching.value = true;

  await handleSearch(search);
  searching.value = false;
}, 400);

watch(
  () => search.value,
  () => {
    debouncedSearch(search.value);
  },
  { immediate: false }
);
</script>

<template>
  <div
    class="flex flex-col md:flex-row w-full h-full place-items-center place-content-between md:place-content-between gap-6 px-3 relative"
  >
    <div
      class="flex flex-row-reverse w-full max-w-none md:max-w-full md:flex-row flex-wrap-reverse gap-4 place-content-between flex-1"
    >
      <div
        class="flex place-content-start md:place-content-center place-items-end h-full w-full md:max-w-xs md:mr-auto gap-4"
      >
        <InputText
          placeholder="Search"
          type="text"
          pt:root="w-full"
          v-model="search"
        />
      </div>
      <h1
        class="text-4xl font-bold text-start md:text-center capitalize mr-auto"
      >
        {{ title }}
      </h1>
    </div>
    <div
      class="flex mt-auto flex-wrap text-2xl font-bold h-full place-content-between gap-4 relative"
    >
      <Button
        v-if="!fileUpload"
        label="New"
        icon="pi pi-plus"
        @click="navigateTo('new-image')"
      />

      <FileUpload
        v-else
        mode="basic"
        :chooseLabel="uploading ? 'Uploading' : buttonAddLabel"
        name="mainFileUpload"
        :accept
        :auto="true"
        @select="uploadFunc($event)"
        customUpload
        :multiple="true"
        :disabled="uploading"
      />

      <AppButtonDelete
        :label="deleteLabel"
        :disabled="!selectedItems || selectedItems.length === 0 || deleting"
        :clickEvent="handleDeletion"
      />
      <Button
        icon="pi pi-refresh"
        :loading="fetching"
        rounded
        raised
        @click="() => $emit('refetch')"
      />
    </div>
  </div>
</template>
