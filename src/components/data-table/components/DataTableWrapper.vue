<script setup lang="ts">
import { ref } from "vue";
import type { FilterType, PostData } from "../../../types/types";
import { useToastService } from "../../../composable/toastService/AppToastService";
import { useAppRouter } from "../../../composable/router/useAppRouter";
import apiPosts from "../../../axios/api/posts";

const props = withDefaults(
  defineProps<{
    data: any[];
    columns: string[];
    loading: boolean;
    filters?: Record<string, FilterType>;
    rows?: number;
    selection?: any;
    class?: any;
    multiple?: boolean;
  }>(),
  {
    filters: () => ({}),
    rows: 10,
    selection: () => null,
    loading: true,
    multiple: false,
  }
);

const defaultOptions = {
  paginator: true,
  rowsPerPageOptions: [5, 10, 20, 50],
  removableSort: true,
  tableStyle: "min-width: 50rem; ",
  pt: {
    root: "w-full h-fit ",
  },
  dataKey: "id",
};

const emit = defineEmits(["update:selection", "refetch"]);
const { showSuccess, showError } = useToastService();
const { navigateTo } = useAppRouter();

const localSelection = ref<any>(props.selection);
const cm = ref();

const updateSelection = (val: any) => {
  localSelection.value = val;
  emit("update:selection", val);
};

const menuModel = ref([
  {
    label: "View",
    icon: "pi pi-fw pi-search",
    command: () => viewProduct(localSelection.value),
  },
  {
    label: "Delete",
    icon: "pi pi-fw pi-times",
    command: () => deleteProduct(localSelection.value),
  },
]);
const onRowContextMenu = (event: any) => {
  cm.value.show(event.originalEvent);
};
const viewProduct = (item: PostData) => {
  navigateTo("post-view", { id: item.id });
  updateSelection(null);
};

const deleteProduct = (item: PostData) => {
  const deleteItem = async () => {
    try {
      await apiPosts.deletePost(item.id);
      showSuccess("Post deleted successfully");
      updateSelection(null);
      emit("refetch", true);
    } catch (error: any) {
      const detail = new Error(error.message);
      console.error("Error deleting post:", error);
      showError("Error deleting post", detail);
    }
  };

  deleteItem();

  localSelection.value = null;
};
</script>

<template>
  <ContextMenu ref="cm" :model="menuModel" @hide="localSelection = null" />
  <div class="w-full h-full shadow-md" v-memo="[props.data, localSelection]">
    <DataTable
      :value="data"
      :filters="filters"
      :globalFilterFields="columns"
      :paginator="defaultOptions.paginator"
      :rows="rows"
      :rowsPerPageOptions="defaultOptions.rowsPerPageOptions"
      :removableSort="defaultOptions.removableSort"
      :tableStyle="defaultOptions.tableStyle"
      :pt="defaultOptions.pt"
      :selectionMode="multiple ? 'multiple' : 'single'"
      :metaKeySelection="multiple ? true : false"
      :selection="localSelection"
      @update:selection="updateSelection"
      contextMenu
      v-model:contextMenuSelection="localSelection"
      @rowContextmenu="onRowContextMenu"
      dataKey="id"
      :loading="loading"
      showGridlines
      scrollable
      scrollHeight="100%"
      :class
      sortField="created at"
      :sortOrder="-1"
    >
      <template #header>
        <slot name="header" />
      </template>

      <slot />

      <template #empty>
        <slot name="empty" />
      </template>

      <template #loading>
        <slot name="loading" />
      </template>
    </DataTable>
  </div>
</template>
