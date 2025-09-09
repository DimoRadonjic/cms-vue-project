<script setup lang="ts">
import { Ban, TriangleAlert } from "lucide-vue-next";
import AppButton from "../components/ui/AppButton.vue";
import { useAppRouter } from "../composable/router/useAppRouter";

const { goBack } = useAppRouter();
</script>

<template>
  <div
    class="flex flex-col gap-8 items-center justify-center h-fit border border-primary rounded-2xl text-center p-6 bg-primary"
  >
    <div class="text-red-500">
      <Ban class="w-16 h-16" />
    </div>

    <h1
      class="flex place-content-center place-items-center text-4xl font-bold gap-5"
    >
      <TriangleAlert class="text-yellow-500" />
      <span> 404 </span>

      <TriangleAlert class="text-yellow-500" />
    </h1>

    <p class="text-xl">Oops! The page you're looking for does not exist.</p>

    <AppButton
      label="Go Back Home"
      type="button"
      :clickEvent="() => goBack()"
    />
  </div>
</template>
