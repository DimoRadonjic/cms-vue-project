<script setup lang="ts">
import { ref } from "vue";
import type { DocumentItem } from "../../types/types";

type NewDocument = Omit<DocumentItem, "id">;

const initalValues: NewDocument = {
  path: "",
  post_id: null,
  title: "",
  url: "",
};
const formValues = ref<NewDocument>({ ...initalValues });
</script>

<template>
  <div
    class="w-fit bg-primary p-6 rounded flex flex-col place-items-center gap-6"
  >
    <h2 class="text-2xl font-bold mx-auto">New Document</h2>
    <Form class="flex gap-12">
      <div class="flex flex-col place-content-center place-items-start gap-3">
        <div class="flex flex-col place-content-center place-items-start gap-3">
          <div class="flex place-content-center place-items-center gap-x-3">
            <Type class="icon" />
            <label for="title" class="text-2xl font-bold">Title</label>
          </div>
          <AppInputTextField
            placeholder="Document title"
            fieldName="title"
            :initialValue="formValues.title"
            type="text"
          />
        </div>
      </div>

      <DocumentUpload />
    </Form>
  </div>
</template>
