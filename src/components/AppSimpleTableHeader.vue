<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import type { DocumentItem } from "../types/types";

type BaseProps = {
  selectedItem: DocumentItem[];
  title: string;
  buttonAddLabel?: string;
  openModal?: boolean;
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
  "update:openModal",
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
    class="flex flex-col md:flex-row w-full h-full place-items-center place-content-between md:place-content-between gap-6 px-3 relative"
  >
    <div
      class="flex flex-row-reverse w-full max-w-none md:max-w-full md:flex-row flex-wrap-reverse gap-4 place-content-between flex-1"
    >
      <div
        class="flex place-content-start md:place-content-center place-items-end h-full w-full md:max-w-fit md:mr-auto gap-4"
      >
        <InputText
          placeholder="Search"
          type="text"
          pt:root="w-full max-w-fit"
          v-model="search"
        />
        <Button
          label="Search"
          icon="pi pi-search"
          class="!px-5 my-auto"
          :disabled="search === '' ? true : false"
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
        ref="fileUploadRef"
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
        :disabled="!selectedItem || selectedItem.length === 0 || deleting"
        :clickEvent="handleDeletion"
      />
      <Button icon="pi pi-refresh" rounded raised @click="$emit('refetch')" />
    </div>
  </div>
</template>
