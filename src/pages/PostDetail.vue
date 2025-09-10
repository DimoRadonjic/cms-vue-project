<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useToastService } from "../composable/toastService/AppToastService";
import type { ImageItem, PostWithContent } from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";
import {
  Files,
  FileText,
  Globe,
  Image,
  Images,
  Link,
  Tags,
  Type,
  UserPen,
  Wallpaper,
} from "lucide-vue-next";
import FormEditPost from "../components/forms/FormEditPost.vue";
import DocumentLink from "../components/DocumentLink.vue";
import ImageLink from "../components/ImageLink.vue";

const { showError } = useToastService();

const { getRouteID, goBack } = useAppRouter();

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
const uploading = ref(false);
const hasChanged = ref(true);
const loading = ref(false);

watchEffect(async () => {
  try {
    loading.value = true;
    const post = await getPostById(postId);
    postDetail.value = post as PostWithContent;
    loading.value = false;
  } catch (error) {
    showError("Failed to load post data", 3000);
    loading.value = false;
  }
});

const cancleEdit = () => {
  editingPost.value = false;
};

const editPost = () => {
  editingPost.value = true;
};

const updatePost = () => {
  editingPost.value = true;
};

const handleInput = () => {
  hasChanged.value = true;
};
</script>

<template>
  <div
    class="flex flex-col gap-8 bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary w-full max-w-fit mx-auto"
  >
    <FormEditPost
      v-if="postDetail && !loading && initialValues"
      @uploading-change="uploading = $event"
      v-model:data="initialValues"
      v-model:hasChanged="hasChanged"
      @input="handleInput"
    >
      <template #header>
        <h1
          v-if="editingPost"
          class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
        >
          Edit Post Details
        </h1>
        <h1
          v-else
          class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
        >
          Post Details
        </h1>
      </template>

      <template #body v-if="!editingPost">
        <div
          class="flex flex-col place-content-center gap-12 w-full h-full place-items-start"
        >
          <div class="flex flex-wrap gap-12">
            <div
              class="h-fit flex flex-col gap-5 border border-primary rounded-xl p-4"
            >
              <h2 class="text-2xl font-bold">Main info</h2>
              <div
                class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Type class="icon" />
                  <h3 class="text-2xl font-bold">Title</h3>
                </div>
                <p class="text-xl font-semibold">
                  {{ initialValues?.title }}
                </p>
              </div>

              <div
                class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-5"
                >
                  <UserPen class="icon" />
                  <h3 class="text-2xl font-bold">Author</h3>
                </div>
                <p class="text-xl font-semibold">
                  {{ initialValues?.authorUsername }}
                </p>
              </div>

              <div
                class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
              >
                <div
                  class="flex place-content-start place-items-center gap-x-5"
                >
                  <FileText class="icon" />
                  <h3 class="text-2xl font-bold">Description</h3>
                </div>
                <p class="text-xl font-semibold">
                  {{ initialValues?.description }}
                </p>
              </div>
            </div>

            <div
              class="border border-primary rounded-xl p-4 flex flex-col gap-5"
            >
              <h2 class="text-2xl font-bold">SEO info</h2>

              <div class="flex flex-wrap">
                <div>
                  <div
                    class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
                  >
                    <div
                      class="flex place-content-center place-items-center gap-x-5"
                    >
                      <Link class="icon" />
                      <h3 class="text-2xl font-bold">Slug</h3>
                    </div>
                    <h2 class="text-xl font-bold">
                      {{ initialValues?.seo_slug }}
                    </h2>
                  </div>

                  <div
                    class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
                  >
                    <div
                      class="flex place-content-center place-items-center gap-x-5"
                    >
                      <Tags class="icon" />
                      <h3 class="text-2xl font-bold">Keywords</h3>
                    </div>
                    <p class="text-xl font-semibold">
                      {{ initialValues?.seo_keywords }}
                    </p>
                  </div>

                  <div
                    class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
                  >
                    <div
                      class="flex place-content-center place-items-center gap-x-5"
                    >
                      <FileText class="icon" />

                      <h3 class="text-2xl font-bold">Meta Description</h3>
                    </div>
                    <p class="text-xl font-semibold">
                      {{ initialValues?.seo_metaDescription }}
                    </p>
                  </div>
                </div>
                <div>
                  <div
                    class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
                  >
                    <div
                      class="flex place-content-center place-items-center gap-x-5"
                    >
                      <Type class="icon" />
                      <h3 class="text-2xl font-bold">Meta Title</h3>
                    </div>
                    <p class="text-xl font-semibold">
                      {{ initialValues?.seo_metaTitle }}
                    </p>
                  </div>
                  <div
                    class="flex flex-col place-content-center place-items-start gap-3 rounded p-4"
                  >
                    <div
                      class="flex place-content-center place-items-center gap-x-5"
                    >
                      <Globe class="icon" />

                      <h3 class="text-2xl font-bold">Canonical URL</h3>
                    </div>
                    <p class="text-xl font-semibold">
                      {{ initialValues?.seo_canonicalUrl }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="border border-primary rounded-xl p-4 flex flex-col gap-5 w-full"
          >
            <h2 class="text-xl font-bold">Uploads</h2>
            <div
              class="flex flex-wrap w-full place-content-center md:place-content-between gap-12"
            >
              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-5"
                >
                  <Wallpaper />
                  <h3 class="text-2xl font-bold">Main Image</h3>
                </div>

                <div class="w-full max-w-sm">
                  <img
                    v-if="postDetail.mainImage"
                    :src="postDetail.mainImage.url"
                    :alt="postDetail.mainImage.alt"
                    class="object-cover w-full h-full"
                  />
                  <Image v-else class="w-full h-full z-10" />
                </div>
              </div>

              <div
                class="flex flex-wrap gap-12 place-content-start place-items-start"
              >
                <div
                  class="flex flex-col place-content-center place-items-start gap-3"
                >
                  <div
                    class="flex place-content-center place-items-center gap-x-5"
                  >
                    <Files />
                    <h3 class="text-2xl font-bold">Documents</h3>
                  </div>
                  <div
                    v-if="postDetail?.documents.length > 0"
                    v-for="document in postDetail?.documents"
                    class="flex flex-col gap-6"
                  >
                    <DocumentLink :document />
                  </div>
                  <div v-else>No documents</div>
                </div>

                <div
                  class="flex flex-col place-content-center place-items-start gap-3"
                >
                  <div
                    class="flex place-content-center place-items-center gap-x-5"
                  >
                    <Images />
                    <h3 class="text-2xl font-bold">Images</h3>
                  </div>

                  <div
                    v-if="postDetail?.images.length > 0"
                    v-for="image in postDetail?.images"
                    class="flex flex-col gap-6"
                  >
                    <ImageLink :image />
                  </div>
                  <div v-else>No images</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex mx-auto gap-6 mt-4">
            <AppButton type="button" label="Edit" :clickEvent="editPost" />

            <AppButton type="button" label="Back" :clickEvent="goBack" />
          </div>
        </div>
      </template>

      <template #buttons>
        <div class="flex justify-center gap-6 mt-4">
          <AppButton
            :type="'submit'"
            :label="'Done'"
            :clickEvent="updatePost"
            :disabled="hasChanged"
          />

          <AppButton
            :type="'reset'"
            :label="'Cancel'"
            :clickEvent="cancleEdit"
          />
        </div>
      </template>
    </FormEditPost>

    <div v-if="loading" class="w-full h-full">
      <ProgressSpinner
        style="width: 80px; height: 80px"
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
        aria-label="Custom ProgressSpinner"
      />
    </div>
  </div>
</template>
