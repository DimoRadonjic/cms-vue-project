<script setup lang="ts">
import { reactive, ref, watch, watchEffect } from "vue";
import type { FilterType, PostWithContent } from "../../types/types";
import { usePosts } from "../../composable";
import { useAppRouter } from "../../composable/router/useAppRouter";

const props = withDefaults(
  defineProps<{
    data: PostWithContent[];
    title: string;
    loading: boolean;
    error: boolean;
    sortable?: boolean;
    filter?: boolean;
    columns?: string[];
    onRefetch?: () => void;
  }>(),
  {
    data: () => [],
    title: "",
    loading: true,
    sortable: true,
    error: false,
    filter: true,
    columns: () => ["id"],
    onRefetch: () => {},
  }
);

const { searchPosts } = usePosts();
const { navigateTo } = useAppRouter();

const emit = defineEmits(["selectedData"]);

const selectedData = ref();
const localData = ref([...props.data]);

const filterGlobal = reactive<Record<string, FilterType>>({
  global: { value: "", matchMode: "contains" },
});

const onSelectionChange = (selection: any) => {
  selectedData.value = selection;
  emit("selectedData", selection);
};

const dateFormatter = (value: string) => {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

watch(
  () => props.data,
  (newData) => {
    localData.value = [...newData];
  },
  { deep: true, immediate: true }
);

watchEffect(() => {
  if (filterGlobal.global.value) {
    searchPosts(filterGlobal.global.value);
  }
});
</script>

<template>
  <DataTableWrapper
    :data="data"
    :filters="filterGlobal"
    :loading="loading"
    :columns="columns"
    :rows="10"
    v-model:selection="selectedData"
    @update:selection="onSelectionChange"
    @refetch="onRefetch"
    :multiple="true"
  >
    <template #header>
      <TableHeader
        :title
        :filterGlobal
        :loading
        v-model:selectedItem="selectedData"
        v-model:data="localData"
        @refetch="onRefetch"
      />
    </template>

    <template #loading v-if="loading">
      <div
        class="flex place-content-center place-items-center w-full h-full text-3xl"
      >
        <ProgressSpinner
          style="width: 80px; height: 80px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
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

    <template v-if="data.length > 0 && !loading" class="relative">
      <div class="w-full h-full absolute bg-black/50 z-10" v-if="loading">
        <ProgressSpinner
          style="width: 80px; height: 80px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <Column
        v-for="col in columns"
        :field="col"
        :header="col"
        :sortable
        :filter
        :filterField="col"
        :key="col"
        class="relative"
      >
        <template #body="slotProps" :key="slotProps.data.id">
          <div v-if="col.includes('created')" class="relative">
            <span>
              {{ dateFormatter(slotProps.data["created_at"]) }}
            </span>
            <div
              class="flex gap-2 absolute right-0 top-0 hover:cursor-pointer"
              @click="navigateTo('post-view', { id: slotProps.data.id })"
            >
              <button>
                <i class="pi pi-search"></i>
              </button>
            </div>
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
