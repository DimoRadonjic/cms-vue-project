<script setup lang="ts">
import { watchEffect } from "vue";
import apiPosts from "../../../axios/api/posts";
import { useAppRouter } from "../../../composable/router/useAppRouter";
import type { FilterType, PostData } from "../../../types/types";

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
  let newData;

  if (!selectedItem) return;

  const ids: string[] = selectedItem.map((item) => item.id);

  if (selectedItem.length === 1) {
    newData = await apiPosts.deletePost(ids[0]);
    console.log("newData", newData);
  } else {
    newData = await apiPosts.deletePosts(ids);
  }

  emit("update:selectedItem", null);
  emit("refetch");
};

const handleExport = (posts: PostData[]) => {
  // Za sad samo da radi
  // mozda maci potpuno opciju ili odraditi na izgledu

  if (!posts || posts.length === 0) {
    alert("Nema podataka za eksport");
    return;
  }

  const csvData = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    author: post.authorUsername,
    mainImageId: post.mainImageId,
    imageCount: post.imageIds.length,
    documentCount: post.documentIds.length,
    slug: post.seo_slug,
    metaTitle: post.seo_metaTitle,
    keywords: post.seo_keywords.join(", "),
  }));

  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `posts_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.click();
  URL.revokeObjectURL(url);
};

import { ref } from "vue";
const searchBar = ref<HTMLInputElement | null>(null);

const expandSearchBar = () => {
  if (searchBar.value) {
    searchBar.value.style.width = "300px";
    searchBar.value.focus();
  }
};

watchEffect(() => {
  if (searchBar) {
    console.log("searchBar.value:", searchBar.value?.style);
  }
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-x-12">
    <span class="text-4xl font-bold">{{ title }}</span>
    <div class="flex place-content-center place-items-center gap-x-2.5">
      <Toolbar class="border-none">
        <template #start>
          <div class="flex flex-wrap gap-4">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" @click="expandSearchBar" />
              </InputIcon>
              <InputText
                v-model="filterGlobal['global'].value"
                placeholder="Keyword Search"
                ref="searchBar"
                class="search-input"
                pt:root="w-full"
              />
            </IconField>
            <div class="flex flex-wrap gap-4">
              <Button
                label="New"
                icon="pi pi-plus"
                class="mr-2"
                @click="navigateTo('new-post')"
              />

              <Button
                :label="
                  selectedItem
                    ? selectedItem.length > 1
                      ? selectedItem.length + ' items to ' + 'delete'
                      : 'Delete a item '
                    : 'Delete'
                "
                icon="pi pi-trash"
                severity="danger"
                variant="outlined"
                :disabled="!selectedItem"
                @click="handleDeletion()"
              />
            </div>
          </div>
        </template>
        <template #center>
          <div class="flex flex-wrap w-full gap-x-4">
            <Button
              label="Export"
              icon="pi pi-upload"
              severity="secondary"
              @click="handleExport(data)"
            />
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

<style scoped>
.p-toolbar {
  @apply border-none rounded-none;
}
</style>
