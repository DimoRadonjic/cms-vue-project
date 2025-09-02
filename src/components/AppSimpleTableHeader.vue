<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import type { DocumentItem } from "../types/types";

type BaseProps = {
  selectedItem: DocumentItem[];
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

const emit = defineEmits([
  "refetch",
  "update:data",
  "update:selectedItem",
  "uploading",
]);

const { navigateTo } = useAppRouter();

const fileUploadRef = ref<any>();
const uploading = ref<boolean>(false);
const deleting = ref(false);

const search = ref<string>("");

const deleteLabel = computed(() => {
  return deleting.value
    ? "Deleting"
    : props.selectedItem && props.selectedItem.length > 0
    ? `Delete ${props.selectedItem.length}`
    : "No item selected";
});

const handleDeletion = async () => {
  const { selectedItem } = props;

  if (!selectedItem) return;

  deleting.value = true;

  try {
    if (props.delete) {
      await props.delete(selectedItem);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }

  emit("update:selectedItem", []);

  emit("refetch", true);

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

  emit("update:selectedItem", []);

  emit("refetch", true);

  uploading.value = false;
};
</script>

<template>
  <div
    class="flex flex-wrap md:grid md:grid-cols-3 w-full h-full place-items-center place-content-between md:place-content-center gap-6 px-3 relative"
  >
    <div class="flex place-content-center place-items-center mr-auto gap-4">
      <InputText placeholder="Search" type="text" v-model="search" />
      <Button
        label="Search"
        icon="pi pi-search"
        class="!px-5"
        :disabled="search === '' ? true : false"
      />
    </div>
    <h1
      class="text-4xl font-bold md:col-start-2 md:col-end-2 md:w-full text-start md:text-center capitalize"
    >
      {{ title }}
    </h1>
    <div class="text-2xl font-bold ml-0 md:ml-auto md:col-start-3 md:col-end-3">
      <div
        class="flex w-full place-items-center place-content-between md:gap-x-4 gap-x-2 relative"
      >
        <Button
          v-if="!fileUpload"
          label="New"
          icon="pi pi-plus"
          class="mr-2"
          @click="navigateTo('new-image')"
        />

        <FileUpload
          v-else
          ref="fileUploadRef"
          mode="basic"
          :chooseLabel="uploading ? 'Uploading' : buttonAddLabel"
          name="mainImageId"
          :accept
          :auto="true"
          @select="uploadFunc($event)"
          customUpload
          :multiple="true"
          :disabled="uploading"
        />
        <Button
          :label="deleteLabel"
          icon="pi pi-trash"
          severity="danger"
          variant="outlined"
          :disabled="!selectedItem || selectedItem.length === 0 || deleting"
          @click="handleDeletion()"
        />
        <Button icon="pi pi-refresh" rounded raised @click="$emit('refetch')" />
      </div>
    </div>
  </div>
</template>
