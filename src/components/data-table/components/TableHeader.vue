<script setup lang="ts">
import apiPosts from "../../../axios/api/posts";
import { useAppRouter } from "../../../composable/router/useAppRouter";
import type { FilterType, PostWithContent } from "../../../types/types";

const props = withDefaults(
  defineProps<{
    title: string;
    filterGlobal?: Record<string, FilterType>;
    selectedItem: any[] | null;
    data: any[];
  }>(),
  {
    title: "",
    filterGlobal: () => ({
      global: { value: "", matchMode: "contains" },
    }),
    selectedItem: null,
  }
);

const emit = defineEmits(["refetch", "update:data", "update:selectedItem"]);
const { navigateTo } = useAppRouter();

const handleDeletion = async () => {
  const { selectedItem } = props;

  if (!selectedItem) return;

  const ids: string[] = selectedItem.map((item) => item.id);

  try {
    await apiPosts.deletePosts(ids);
  } catch (error) {}

  emit("update:selectedItem", null);
  emit("refetch");
};
</script>

<template>
  <div class="flex flex-wrap items-end justify-center gap-x-12">
    <h1 class="text-5xl font-bold">{{ title }}</h1>
    <div class="flex place-content-center place-items-end gap-x-2.5 h-full">
      <Toolbar class="!border-none !rounded-none !p-0 !gap-4">
        <template #start>
          <div class="flex flex-wrap gap-4">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filterGlobal['global'].value"
                placeholder="Search"
                class="search-input"
                pt:root="w-full"
              />
            </IconField>
            <div class="flex flex-wrap gap-4">
              <Button
                label="New"
                icon="pi pi-plus"
                @click="navigateTo('new-post')"
              />

              <AppButtonDelete
                :label="
                  selectedItem
                    ? selectedItem.length > 1
                      ? selectedItem.length + ' items to ' + 'delete'
                      : 'Delete a item '
                    : 'Delete'
                "
                :disabled="!selectedItem"
                :clickEvent="handleDeletion"
              />
            </div>
          </div>
        </template>
        <template #center>
          <div class="flex flex-wrap w-full gap-x-4">
            <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="$emit('refetch')"
            />
          </div>
        </template>
      </Toolbar>
    </div>
  </div>
</template>
