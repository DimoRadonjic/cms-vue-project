<script setup lang="ts">
import { useAuth } from "../composable";

const { reRouteAuth } = useAuth();

reRouteAuth();
</script>

<template>
  <div class="pb-11 w-full">
    <router-view />
  </div>
</template>
