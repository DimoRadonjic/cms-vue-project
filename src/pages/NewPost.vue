<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { reactive } from "vue";
import z from "zod";
import { useToastService } from "../composable/toastService/AppToastService";
import apiPosts from "../axios/api/posts";
import type { NewPost } from "../types/types";

const initialValues = reactive<NewPost>({
  title: "",
  mainImageId: "",
  description: "",
  authorUsername: "",
  documentIds: [],
  imageIds: [],
  seo_slug: "",
  seo_metaTitle: "",
  seo_metaDescription: "",
  seo_keywords: [],
  seo_canonicalUrl: "",
});

const { showError } = useToastService();

const schema = z.object({
  title: z.string().min(1, {
    message: "Username is required.",
  }),
  mainImageId: z.string().min(1, {
    message: "Password is required.",
  }),
  description: z.string().min(1, {
    message: "Password is required.",
  }),
  authorUsername: z.string().min(1, {
    message: "Password is required.",
  }),
  documentIds: z.string().min(1, {
    message: "Password is required.",
  }),
  seo_slug: z.string().min(1, {
    message: "Password is required.",
  }),
  seo_metaTitle: z.string().min(1, {
    message: "Password is required.",
  }),
  seo_metaDescription: z.string().min(1, {
    message: "Password is required.",
  }),
  seo_keywords: z.string().min(1, {
    message: "Password is required.",
  }),
  seo_canonicalUrl: z.string().min(1, {
    message: "Password is required.",
  }),
});

const resolver = zodResolver(schema);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    showError("Creatiton failed.", 3000);
    return;
  }

  const valuesToSend: NewPost = {
    ...(values as NewPost),
    documentIds: values.documentIds
      .split(",")
      .map((v: any) => Number(v.trim())),
    seo_keywords: values.seo_keywords.split(",").map((v: any) => v.trim()),
  };

  await apiPosts.createPost(valuesToSend as NewPost);
};
</script>

<template>
  <Form
    :initialValues
    :resolver
    @submit="onFormSubmit"
    :validateOnValueUpdate="true"
    :validateOnBlur="true"
    class="flex flex-col gap-8 bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
  >
    <h1
      class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
    >
      New Post
    </h1>

    <div
      class="flex flex-col w-full place-content-center place-items-center gap-y-5"
    >
      <div class="w-full max-w-fit flex gap-y-2 gap-x-12">
        <div class="w-full max-w-fit flex flex-col gap-y-2">
          <span>Main</span>

          <div class="w-full max-w-fit flex flex-col gap-y-2">
            <AppInputTextField
              placeholder="Title"
              fieldName="title"
              initialValue=""
              type="text"
            />

            <AppInputTextField
              placeholder="Main Image ID"
              fieldName="mainImageId"
              initialValue=""
              type="text"
            />

            <AppInputTextField
              placeholder="authorUsername"
              fieldName="authorUsername"
              initialValue=""
              type="text"
            />

            <AppInputArrayField
              placeholder="documentIds"
              fieldName="documentIds"
              initialValue=""
              type="text"
            />
            <AppTextAreaField
              placeholder="Description"
              fieldName="description"
              initialValue=""
            />
          </div>
        </div>

        <div class="w-full max-w-fit flex flex-col gap-y-2">
          <span>SEO</span>

          <div class="w-full max-w-fit flex flex-col gap-y-2">
            <AppInputTextField
              placeholder="slug"
              fieldName="seo_slug"
              initialValue=""
              type="text"
            />
            <AppInputTextField
              placeholder="metaTitle"
              fieldName="seo_metaTitle"
              initialValue=""
              type="text"
            />
            <AppInputArrayField
              placeholder="keywords"
              fieldName="seo_keywords"
              initialValue=""
              type="text"
            />
            <AppInputTextField
              placeholder="canonicalUrl"
              fieldName="seo_canonicalUrl"
              initialValue=""
              type="text"
            />
            <AppTextAreaField
              placeholder="metaDescription"
              fieldName="seo_metaDescription"
              initialValue=""
            />
          </div>
        </div>
      </div>
      <div
        class="w-full flex flex-col place-content-center place-items-center gap-y-5"
      >
        <Button
          type="submit"
          label="Create"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />
      </div>
    </div>
  </Form>
</template>
