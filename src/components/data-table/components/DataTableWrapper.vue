<script setup lang="ts">
import { ref, watch } from "vue";
import type { FilterType, PostWithContent } from "../../../types/types";
import { useToastService } from "../../../composable/toastService/AppToastService";
import { useAppRouter } from "../../../composable/router/useAppRouter";
import apiPosts from "../../../axios/api/posts";

const props = withDefaults(
  defineProps<{
    data: PostWithContent[];
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
  tableStyle: "min-width: 50rem; min-height:25vh;  ",
  pt: {
    root: "w-full h-fit max-h-fit ",
  },
  dataKey: "id",
};

const emit = defineEmits(["update:selection", "refetch"]);
const { showSuccess, showError } = useToastService();
const { navigateTo } = useAppRouter();

const localSelectionArr = defineModel<PostWithContent[]>("selectionArr", {
  default: [],
});

const localSelectionItem = ref<PostWithContent | null>(null);

const cm = ref();

const menuModel = ref([
  {
    label: "View",
    icon: "pi pi-fw pi-search",
    command: () =>
      localSelectionItem.value && viewProduct(localSelectionItem.value),
  },
  {
    label: "Delete",
    icon: "pi pi-fw pi-times",
    command: () =>
      localSelectionItem.value && deleteProduct(localSelectionItem.value),
  },
]);
const onRowContextMenu = (event: any) => {
  cm.value.show(event.originalEvent);
};
const viewProduct = (item: PostWithContent) => {
  navigateTo("post-view", { id: item.id });
  localSelectionItem.value = null;
};

const deleteProduct = async (item: PostWithContent) => {
  try {
    await apiPosts.deletePost(item.id);
    showSuccess("Post deleted successfully");
    localSelectionItem.value = null;
    emit("refetch");
  } catch (error: any) {
    const detail = new Error(error.message);
    console.error("Error deleting post:", error);
    showError("Error deleting post", detail);
  }
};

watch(
  () => localSelectionItem.value,
  (newValue) => {
    if (Array.isArray(newValue)) {
      localSelectionArr.value = [...newValue];
    } else if (newValue) {
      localSelectionArr.value = [newValue];
    } else {
      localSelectionArr.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <ContextMenu ref="cm" :model="menuModel" @hide="localSelectionItem = null" />
  <div
    class="w-full h-full shadow-md"
    v-memo="[props.data, localSelectionItem]"
  >
    <DataTable
      :value="data"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="columns"
      :paginator="defaultOptions.paginator"
      :rows="rows"
      :rowsPerPageOptions="defaultOptions.rowsPerPageOptions"
      :removableSort="defaultOptions.removableSort"
      :tableStyle="defaultOptions.tableStyle"
      :pt="defaultOptions.pt"
      :selectionMode="multiple ? 'multiple' : 'single'"
      :metaKeySelection="multiple ? true : false"
      v-model:selection="localSelectionItem"
      contextMenu
      v-model:contextMenuSelection="localSelectionItem"
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

      <template #loading class="min-h-full">
        <slot name="loading" />
      </template>
    </DataTable>
  </div>
</template>
