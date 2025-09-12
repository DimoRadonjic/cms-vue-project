<script setup lang="ts">
import apiPosts from "../../../axios/api/posts";
import { useAppRouter } from "../../../composable/router/useAppRouter";
import { useToastService } from "../../../composable/toastService/AppToastService";
import type { FilterType, PostWithContent } from "../../../types/types";

withDefaults(
  defineProps<{
    title: string;
    filterGlobal?: Record<string, FilterType>;
    data: PostWithContent[];
    loading: boolean;
  }>(),
  {
    title: "",
    filterGlobal: () => ({
      global: { value: "", matchMode: "contains" },
    }),
    loading: false,
  }
);
const { navigateTo } = useAppRouter();
const { showError } = useToastService();

const emit = defineEmits(["refetch"]);

const selectedItem = defineModel<PostWithContent[]>("selectedItem", {
  default: [],
});

const handleDeletion = async () => {
  if (!selectedItem.value) return;

  const ids: string[] = selectedItem.value.map((item) => item.id);

  try {
    await apiPosts.deletePosts(ids);
  } catch (error: any) {
    console.error(error.message);
    showError("Failed to delete post", error.message);
  }
  selectedItem.value = [];
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
                  selectedItem.length !== 0
                    ? selectedItem.length > 1
                      ? selectedItem.length + ' items to ' + 'delete'
                      : 'Delete a item '
                    : 'Delete'
                "
                :disabled="selectedItem.length === 0"
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
              :loading
              @click="$emit('refetch')"
            />
          </div>
        </template>
      </Toolbar>
    </div>
  </div>
</template>
