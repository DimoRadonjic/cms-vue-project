<script setup lang="ts">
import { watch, ref } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import apiDocuments from "../axios/api/documents";

const props = defineProps<{
  selectedItem: any[];
  title: string;
}>();

const emit = defineEmits(["refetch", "update:data", "update:selectedItem"]);

const { navigateTo } = useAppRouter();

const handleDeletion = async () => {
  const { selectedItem } = props;

  if (!selectedItem) return;

  const ids: string[] = selectedItem.map((item) => item.id);

  try {
    await apiDocuments.deleteDocumentsAPI(ids);
  } catch (error) {}

  emit("update:selectedItem", null);
  emit("refetch");
};

function setDeleteLabel() {
  return props.selectedItem && props.selectedItem.length > 0
    ? `Delete ${props.selectedItem.length}`
    : "No item selected";
}

const deleteLabel = ref(setDeleteLabel());

watch(
  () => props.selectedItem,
  () => {
    deleteLabel.value = setDeleteLabel();
  }
);
</script>

<template>
  <div
    class="flex flex-wrap md:grid md:grid-cols-3 w-full h-full place-items-center place-content-between md:place-content-center gap-6 px-3 relative"
  >
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
          label="New"
          icon="pi pi-plus"
          class="mr-2"
          @click="navigateTo('new-image')"
        />
        <Button
          :label="deleteLabel"
          icon="pi pi-trash"
          severity="danger"
          variant="outlined"
          :disabled="!selectedItem || selectedItem.length === 0"
          @click="handleDeletion()"
        />
        <Button icon="pi pi-refresh" rounded raised @click="$emit('refetch')" />
      </div>
    </div>
  </div>
</template>
