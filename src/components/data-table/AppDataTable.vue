<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue";
import type { FilterType, PostWithContent } from "../../types/types";
import { usePosts } from "../../composable";
import { useAppRouter } from "../../composable/router/useAppRouter";
import DataTableWrapper from "./components/DataTableWrapper.vue";
import TableHeader from "./components/TableHeader.vue";
import AppSpinner from "../AppSpinner.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    loading: boolean;
    error: boolean;
    sortable?: boolean;
    filter?: boolean;
    columns?: string[];
    onRefetch?: () => void;
  }>(),
  {
    title: "",
    loading: true,
    sortable: true,
    error: false,
    filter: true,
    columns: () => ["select", "id", "view"],
    onRefetch: () => {},
  }
);

const { searchPosts } = usePosts();
const { navigateTo } = useAppRouter();

const selectedData = ref<PostWithContent[]>([]);

const selectedIds = computed(() =>
  localData.value.filter(
    (item: PostWithContent) => selectedData.value[item.id as any]
  )
);

const localData = defineModel<PostWithContent[]>("data", { default: [] });

const filterGlobal = reactive<Record<string, FilterType>>({
  global: { value: "", matchMode: "contains" },
});

const dateFormatter = (value: string) => {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

watchEffect(() => {
  if (filterGlobal.global.value) {
    searchPosts(filterGlobal.global.value);
  }
});

const addToSelected = (item: PostWithContent) => {
  if (selectedData.value.includes(item)) {
    selectedData.value = selectedData.value.filter(({ id }) => id !== item.id);
  } else {
    selectedData.value.push(item);
  }
};
</script>

<template>
  <DataTableWrapper
    :data="localData"
    :filters="filterGlobal"
    :loading="loading"
    :columns="columns"
    :rows="10"
    v-model:selectionArr="selectedData"
    @refetch="onRefetch"
    :multiple="true"
  >
    <template #header>
      <TableHeader
        :title
        :filterGlobal
        :loading
        v-model:selectedItem="selectedData"
        :data="localData"
        @refetch="onRefetch"
      />
    </template>

    <template #loading v-if="loading">
      <div
        class="flex place-content-center place-items-center w-full text-3xl bg-inherit h-full"
      >
        <AppSpinner />
      </div>
    </template>

    <template #empty>
      <div
        class="flex place-content-center place-items-center w-full h-[50vh] text-3xl"
      >
        <span>No {{ title }} found</span>
        <span class="text-5xl">😔</span>
      </div>
    </template>

    <template v-if="localData.length > 0 && !loading" class="relative">
      <div class="w-full h-full absolute bg-black/50 z-10" v-if="loading">
        <AppSpinner
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <Column
        v-for="col in ['select', ...columns, 'view']"
        :field="col"
        :header="col !== 'select' && col !== 'view' ? col : ''"
        :sortable="col !== 'select' && col !== 'view' ? true : false"
        :filter
        :selectionMode="col === 'select' ? 'multiple' : 'single'"
        :filterField="col"
        :key="col"
        class="relative"
      >
        <template #body="slotProps" :key="slotProps.data.id">
          <div v-if="col.includes('select')" class="relative">
            <Checkbox
              :modelValue="selectedData.includes(slotProps.data) ? true : false"
              @change="addToSelected(slotProps.data)"
              class="w-5 h-5 accent-primary"
              binary
            />
          </div>

          <div v-if="col.includes('view')" class="relative">
            <div
              class="flex gap-2 hover:cursor-pointer"
              @click="navigateTo('post-view', { id: slotProps.data.id })"
            >
              <button class="hover:cursor-pointer">
                <i class="pi pi-search"></i>
              </button>
            </div>
          </div>
          <div v-else-if="col.includes('created')" class="relative">
            <span>
              {{ dateFormatter(slotProps.data["created_at"]) }}
            </span>
          </div>

          <div v-else-if="col.includes('documents')" class="relative">
            <span>{{ slotProps.data["documents"]?.length ?? 0 }} </span>
          </div>

          <div v-else-if="col.includes('images')" class="relative">
            <span>{{ slotProps.data["images"]?.length ?? 0 }} </span>
          </div>
          <span v-else>{{ slotProps.data[col] }}</span>
        </template>
      </Column>
    </template>
  </DataTableWrapper>
</template>
