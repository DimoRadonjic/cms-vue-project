<script setup lang="ts">
import { useAuth } from "../composable";

const { reRouteAuth } = useAuth();

reRouteAuth();
</script>

<template>
  <div class="w-full h-full pb-11">
    <router-view />
  </div>
</template>
