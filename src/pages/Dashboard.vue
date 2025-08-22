<script setup lang="ts">
import { usePosts } from "../composable";

const { posts, loading, reFetchPosts, error } = usePosts();

console.log("posts dashboard", posts.value);

const columns = ["id", "title", "description", "createdAt"];
</script>

<template>
  <div class="w-full h-full">
    <div class="flex flex-wrap px-4 h-full w-full gap-4 place-items-start">
      <AppDataTable
        :data="posts"
        title="Posts"
        :loading="loading"
        :onRefetch="() => reFetchPosts()"
        :columns="columns"
        :error
      />
    </div>
  </div>
</template>
