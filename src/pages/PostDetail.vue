<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useToastService } from "../composable/toastService/AppToastService";
import type { ImageItem, PostWithContent } from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";

const { showError } = useToastService();

const { getRouteID } = useAppRouter();

const postId = getRouteID();

const { getPostById } = usePosts();

const basic: PostWithContent = {
  id: "",
  title: "",
  mainImage: {} as ImageItem,
  description: "",
  authorUsername: "",
  documents: [],
  images: [],
  seo_slug: "",
  seo_metaTitle: "",
  seo_metaDescription: "",
  seo_keywords: [],
  seo_canonicalUrl: "",
};

const postDetail = ref<PostWithContent>();
const initialValues = computed(() => postDetail.value ?? basic);
const editingPost = ref(false);

watchEffect(async () => {
  try {
    const post = await getPostById(postId);
    postDetail.value = post as PostWithContent;
  } catch (error) {
    showError("Failed to load post data", 3000);
  }
});

const onFormSubmit = async () => {
  // const valuesToSend: PostWithContent = {
  //   ...(values as Post),
  //   id: postId,
  //   documentIds: values.documentIds
  //     ? values.documentIds.split(",").map((v: any) => Number(v.trim()))
  //     : [],
  //   seo_keywords: values.seo_keywords
  //     ? values.seo_keywords.split(",").map((v: any) => v.trim())
  //     : [],
  //   imageIds: values.imageIds
  //     ? values.imageIds.split(",").map((v: any) => v.trim())
  //     : [],
  // };
  // try {
  //   await apiPosts.updatePost(valuesToSend);
  //   showSuccess("Post edited successfully!");
  //   reFetchPosts();
  //   goBack();
  //   values = initialValues;
  //   return;
  // } catch (error) {
  //   showError("Edit failed.", 3000);
  //   return;
  // } finally {
  //   editingPost.value = false;
  // }
};
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

    <Form @submit="onFormSubmit" v-if="editingPost && postDetail">
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
                :initalValue="initialValues.title"
                type="text"
              />

              <AppInputTextField
                placeholder="authorUsername"
                fieldName="authorUsername"
                :initalValue="initialValues.authorUsername"
                type="text"
              />

              <AppTextAreaField
                :initalValue="initialValues.description"
                placeholder="Description"
                fieldName="description"
              />
            </div>
          </div>

          <div class="w-full max-w-fit flex flex-col gap-y-2">
            <span>SEO</span>

            <div class="w-full max-w-fit flex flex-col gap-y-2">
              <AppInputTextField
                placeholder="slug"
                fieldName="seo_slug"
                :initalValue="initialValues.seo_slug"
                type="text"
              />
              <AppInputTextField
                placeholder="metaTitle"
                fieldName="seo_metaTitle"
                :initalValue="initialValues.seo_metaTitle"
                type="text"
              />
              <AppInputArrayField
                placeholder="keywords"
                :initalValue="initialValues.seo_keywords"
                fieldName="seo_keywords"
                type="text"
              />
              <AppInputTextField
                :initalValue="initialValues.seo_canonicalUrl"
                placeholder="canonicalUrl"
                fieldName="seo_canonicalUrl"
                type="text"
              />
              <AppTextAreaField
                placeholder="metaDescription"
                :initalValue="initialValues.seo_metaDescription"
                fieldName="seo_metaDescription"
              />
            </div>
          </div>
        </div>
        <div class="w-full flex place-content-center place-items-center gap-5">
          <Button type="submit" class="bg-secondary px-4 py-2 font-semibold">
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
            <h2 class="text-2xl font-bold">
              {{ initialValues?.mainImage?.title }}
            </h2>
          </div>
          <div>
            <p>Author Username</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.authorUsername }}
            </h2>
          </div>
          <div>
            <p>Document IDs</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.documents[0]?.title }}
            </h2>
          </div>

          <div>
            <p>Image IDs</p>
            <h2 class="text-2xl font-bold">
              {{ initialValues?.images[0]?.title }}
            </h2>
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
