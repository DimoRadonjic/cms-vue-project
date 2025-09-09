<script setup lang="ts">
import { SquareArrowOutUpRight } from "lucide-vue-next";
import type { DocumentItem } from "../types/types";
import { createLink } from "./utils";
interface Props {
  document: File | DocumentItem;
}

const props = defineProps<Props>();

const target = props.document instanceof File ? "_blank" : "";

const link =
  props.document instanceof File
    ? createLink(props.document)
    : props.document.url;

const title =
  props.document instanceof File ? props.document.name : props.document.title;
</script>

<template>
  <a
    :href="link"
    :target
    class="font-bold flex gap-x-2 place-content-center place-items-center hover:text-primary cursor-pointer"
  >
    <i class="pi pi-file-pdf"></i>

    <span class="underline-animation"> {{ title }}</span>
    <SquareArrowOutUpRight />
  </a>
</template>

<style scoped></style>
