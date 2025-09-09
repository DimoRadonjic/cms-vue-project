<script setup lang="ts">
import { SquareArrowOutUpRight } from "lucide-vue-next";
import type { ImageItem } from "../types/types";
import { createLink } from "./utils";

interface Props {
  image: File | ImageItem;
}

const props = defineProps<Props>();

const target = props.image instanceof File ? "_blank" : "";

const link =
  props.image instanceof File ? createLink(props.image) : props.image.url;

const title =
  props.image instanceof File ? props.image.name : props.image.title;
</script>

<template>
  <a
    :href="link"
    :target
    class="font-bold flex gap-x-2 place-content-center place-items-center hover:text-primary cursor-pointer"
  >
    <i class="pi pi-image" />
    <span class="underline-animation">{{ title }}</span>
    <SquareArrowOutUpRight />
  </a>
</template>

<style scoped></style>
