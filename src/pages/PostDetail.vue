<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { onMounted, ref } from "vue";
import z from "zod";
import { useToastService } from "../composable/toastService/AppToastService";
import apiPosts from "../axios/api/posts";
import type { PostData } from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";

const { showError, showSuccess } = useToastService();

const { goBack, getRouteID } = useAppRouter();

const postId = getRouteID();

const { reFetchPosts, getPostById } = usePosts();

const initialValues = ref();

onMounted(async () => {
  try {
    const post = await getPostById(postId);
    console.log(post);
    initialValues.value = post;
  } catch (error) {
    showError("Failed to load post data", 3000);
  }
});

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

  const valuesToSend: PostData = {
    ...(values as PostData),
    documentIds: values.documentIds
      .split(",")
      .map((v: any) => Number(v.trim())),
    seo_keywords: values.seo_keywords.split(",").map((v: any) => v.trim()),
    imageIds: values.seo_keywords.split(",").map((v: any) => v.trim()),
  };

  try {
    const status = await apiPosts.createPost(valuesToSend as PostData);
    if (status === 201) {
      showSuccess("Post created");
      reFetchPosts();
      goBack();

      values = initialValues;
      return;
    }
  } catch (error) {
    showError("Creatiton failed.", 3000);
    return;
  }
};

const editingPost = ref(false);
</script>

<template>
  <div
    class="flex flex-col gap-8 bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
  >
    <h1
      class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
    >
      Post Details
    </h1>
    <Form
      :initialValues
      :resolver
      @submit="onFormSubmit"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      v-if="editingPost"
    >
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

              <AppInputArrayField
                placeholder="imageIds"
                fieldName="imageIds"
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
        <div class="w-full flex place-content-center place-items-center gap-5">
          <Button
            @click="editingPost = false"
            class="bg-secondary px-4 py-2 font-semibold"
          >
            Save Changes
          </Button>

          <Button
            @click="editingPost = false"
            class="bg-secondary px-4 py-2 font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Form>
    <div v-else>
      <div class="flex gap-8">
        <div>
          <div>
            <p>Title</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.title }}</h2>
          </div>
          <div>
            <p>Main Image ID</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.mainImageId }}</h2>
          </div>
          <div>
            <p>Author Username</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.authorUsername }}
            </h2>
          </div>
          <div>
            <p>Document IDs</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.documentIds }}</h2>
          </div>

          <div>
            <p>Image IDs</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.imageIds }}</h2>
          </div>
          <div>
            <p>Description</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.description }}</h2>
          </div>
        </div>
        <div>
          <div>
            <p>SEO Slug</p>
            <h2 class="text-2xl font-bold">{{ initialValues?.seo_slug }}</h2>
          </div>
          <div>
            <p>SEO Meta Title</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.seo_metaTitle }}
            </h2>
          </div>
          <div>
            <p>SEO Meta Description</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.seo_metaDescription }}
            </h2>
          </div>
          <div>
            <p>SEO Keywords</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.seo_keywords }}
            </h2>
          </div>
          <div>
            <p>SEO Canonical URL</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.seo_canonicalUrl }}
            </h2>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <Button
          label="Edit Post"
          class="w-fit py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          @click="editingPost = true"
        />
      </div>
    </div>
  </div>
</template>
