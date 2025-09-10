<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { computed, reactive, ref, watch } from "vue";
import { useToastService } from "../../composable/toastService/AppToastService";
import apiPosts from "../../axios/api/posts";
import type {
  DocumentItem,
  ImageItem,
  PostData,
  PostWithContent,
} from "../../types/types";
import { useAppRouter } from "../../composable/router/useAppRouter";
import { usePosts } from "../../composable";
import {
  Files,
  FileText,
  Globe,
  Images,
  Link,
  Tags,
  Type,
  UserPen,
} from "lucide-vue-next";
import apiImages from "../../axios/api/images";
import apiDocuments from "../../axios/api/documents";
import { schemaPost } from "./schemas";
import {
  generateCanonicalUrl,
  generateKeywords,
  generateMetaDescription,
  generateSeoSlug,
} from "./seo";
import isEqual from "lodash/isEqual";
import DocumentUpload from "../file-upload/DocumentUpload.vue";
import ImageUpload from "../image-upload/ImageUpload.vue";
import MainImageUpload from "../image-upload/mainImageUpload.vue";

interface Props {
  reset?: boolean;
  data: PostWithContent;
  hasChanged: boolean;
}

const props = defineProps<Props>();

const initialValues = reactive<PostWithContent>({ ...props.data });
const formRef = ref();

const emit = defineEmits([
  "uploading-change",
  "clear-form",
  "update:hasChanged",
]);

defineExpose({ formRef });

const { showError, showSuccess } = useToastService();

const { goBack } = useAppRouter();

const { reFetchPosts } = usePosts();

const resolver = zodResolver(schemaPost);

const documents = ref<DocumentItem[]>([...props.data.documents]);
const newDocuments = ref<File[]>([]);
const existingDocuments = ref<DocumentItem[]>([]);
const removedDocuments = ref<DocumentItem[]>([]);

const images = ref<ImageItem[]>([...props.data.images]);
const newImages = ref<File[]>([]);
const existingImages = ref<ImageItem[]>([]);
const removedImages = ref<ImageItem[]>([]);

const mainImageUpload = ref<File>();
const mainImage = ref<ImageItem | null>(
  props.data.mainImage ? { ...props.data.mainImage } : null
);

const mainImageLoading = ref<boolean>(false);
const mainImageError = ref<boolean>(false);
const removedMainImage = computed(() => !mainImage.value);
const changedMain = computed(() =>
  mainImage.value && mainImage.value.id === initialValues.mainImage.id
    ? false
    : true
);

const imagesError = ref(false);
const documentError = ref(false);
const uploading = ref<boolean>(false);
const clearFiles = ref<boolean>(false);
const availableDocuments = ref<DocumentItem[]>([]);
const availableImages = ref<ImageItem[]>([]);

const change = computed(
  () =>
    !isEqual(existingDocuments.value, initialValues.documents) ||
    !isEqual(existingImages.value, initialValues.images) ||
    removedImages.value.length > 0 ||
    removedDocuments.value.length > 0 ||
    newImages.value.length > 0 ||
    newDocuments.value.length > 0 ||
    removedMainImage.value ||
    changedMain.value
);

watch(
  () => change.value,
  () =>
    change.value
      ? emit("update:hasChanged", false)
      : emit("update:hasChanged", true),
  { immediate: false }
);

const updateSEO = (form: any, value: any) => {
  if (
    form.seo_slug &&
    form.seo_canonicalUrl &&
    form.seo_keywords &&
    form.seo_metaDescription &&
    form.seo_metaTitle
  ) {
    if (!form.seo_slug.touched) {
      form.seo_slug.value = generateSeoSlug(value);
    }

    if (!form.seo_canonicalUrl.touched) {
      const slug = generateSeoSlug(value);
      form.seo_canonicalUrl.value = generateCanonicalUrl(slug);
    }
    if (!form.seo_keywords.touched) {
      form.seo_keywords.value = generateKeywords(value);
    }

    if (!form.seo_metaDescription.touched) {
      form.seo_metaDescription.value = generateMetaDescription(value);
    }

    if (!form.seo_metaTitle.touched) {
      form.seo_metaTitle.value = value;
    }
  }
};

const uploadDocuments = async (files: File[], post_id: string) => {
  try {
    const { data: documnets } = await apiDocuments.uploadDocumentsAPI(
      files,
      post_id
    );

    if (documnets) {
      const fileIds = documnets.map(({ id }) => Number(id));

      return fileIds;
    }
  } catch (error: any) {
    const detail = new Error(error.message);
    showError("Failed to upload documents", detail);
    console.error("Failed to upload documents", error);
    documentError.value = true;
  }
};

const uploadImages = async (files: File[], post_id: string) => {
  try {
    const { data: images } = await apiImages.uploadImagesAPI(files, post_id);

    if (images) {
      const imageIds = images.map(({ id }) => id);
      return imageIds;
    }
  } catch (error: any) {
    const detail = new Error(error.message);
    showError("Failed to upload images", detail);
    console.error("Failed to upload images", error);
    imagesError.value = true;
  }
};

const uploadMainImage = async (mainImage: File, post_id: string) => {
  try {
    const { data: image } = await apiImages.uploadMainImageAPI(
      mainImage,
      post_id
    );

    return image && image;
  } catch (error: any) {
    const detail = new Error(error.message);
    showError("Failed to upload main image", detail);
    console.error("Failed to upload main image", error);
    mainImageError.value = true;
    mainImageLoading.value = false;
  }
};

const handleRemovalDocuments = async (id: string) => {
  const docIds = removedDocuments.value.map(({ id }) => Number(id));
  try {
    await apiDocuments.removePostDocumentAPI(docIds, id);
  } catch (error: any) {
    console.error(error);
    const detail = new Error(error.message);
    showError("Update failed : remove documents.", detail, 3000);
  }
};

const handleRemovalImages = async (id: string) => {
  const imgIds = removedImages.value.map(({ id }) => id);
  try {
    await apiImages.removePostImagesAPI(imgIds, id);
  } catch (error: any) {
    console.error(error);
    const detail = new Error(error.message);
    showError("Update failed : remove images.", detail, 3000);
  }
};

const handleRemovalMainImage = async (
  mainImageID: string,
  id: string,
  valuesToSend: PostData
) => {
  try {
    await apiImages.removePostImagesAPI([mainImageID], id);
    valuesToSend.mainImageId = "";
  } catch (error: any) {
    console.error(error);
    const detail = new Error(error.message);
    showError("Update failed : main image remove link.", detail, 3000);
  }
};

const handleMainImageUpload = async (mainImage: File, id: string) => {
  const mainImageRes: ImageItem | null | undefined = await uploadMainImage(
    mainImage,
    id
  );

  return mainImageRes;
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  const {
    documents: initialDocuments,
    images: initalImages,
    mainImage: initalMainImage,
    ...rest
  } = initialValues;

  const { id, ...postValues } = rest;

  const same =
    isEqual(postValues, values) &&
    isEqual(existingDocuments.value, initialDocuments) &&
    newDocuments.value.length !== 0 &&
    newImages.value.length !== 0 &&
    isEqual(existingDocuments.value, initialDocuments) &&
    isEqual(existingImages.value, initalImages) &&
    !changedMain;

  if (same) {
    showError("Update failed.", new Error("Nothing changed."), 3000);
    return;
  }

  values = { ...rest, ...values };

  if (!valid) {
    showError("Update failed.", new Error("Invalid fields"), 3000);
    return;
  }

  if (removedDocuments.value.length > 0) {
    await handleRemovalDocuments(id);
  }

  if (removedImages.value.length > 0) {
    await handleRemovalImages(id);
  }

  let valuesToSend: PostData = { ...(values as PostData) };

  if (mainImageUpload.value) {
    emit("uploading-change", uploading.value);

    await handleRemovalMainImage(initalMainImage.id, id, valuesToSend);

    const mainImageRes = await handleMainImageUpload(mainImageUpload.value, id);

    if (mainImageRes) {
      valuesToSend.mainImageId = mainImageRes.id;
    }
  }

  if (removedMainImage.value) {
    emit("uploading-change", uploading.value);

    await handleRemovalMainImage(initalMainImage.id, id, valuesToSend);
  }

  if (changedMain.value && mainImage.value) {
    emit("uploading-change", uploading.value);

    await handleRemovalMainImage(initalMainImage.id, id, valuesToSend);

    try {
      await apiImages.addPostImagesAPI([mainImage.value.id], id);
      valuesToSend.mainImageId = mainImage.value.id;
    } catch (error: any) {
      console.error(error);
      const detail = new Error(error.message);
      showError("Update failed : change main image add link ", detail, 3000);
    }
  }

  if (newDocuments.value.length > 0) {
    emit("uploading-change", uploading.value);

    await uploadDocuments(newDocuments.value, id);
  }

  if (newImages.value.length > 0) {
    emit("uploading-change", uploading.value);

    await uploadImages(newImages.value, id);
  }

  if (existingDocuments.value.length > 0) {
    const linked = existingDocuments.value
      .filter((doc) => !initialValues.documents.includes(doc))
      .map(({ id }) => Number(id));

    await apiDocuments.addPostDocumentsAPI(linked, id);
  }

  if (existingImages.value.length > 0) {
    const linked = existingImages.value
      .filter((doc) => !initialValues.images.includes(doc))
      .map(({ id }) => id);

    await apiImages.addPostImagesAPI(linked, id);
  }

  try {
    await apiPosts.updatePost(valuesToSend as PostData);

    if (!uploading.value) {
      showSuccess("Post updated");
      reFetchPosts();
      goBack();
      resetForm();
    }
  } catch (error: any) {
    const detail = new Error(error.message);
    showError("Update failed.", detail, 3000);
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.reset();
  }
};
</script>

<template>
  <Form
    ref="formRef"
    :initialValues
    :resolver
    v-slot="formSlot"
    @submit="onFormSubmit"
    :validateOnValueUpdate="true"
    :validateOnBlur="true"
    @reset="resetForm"
    class="flex flex-col w-full h-full gap-8"
  >
    <slot name="header"> </slot>

    <slot name="body">
      <div
        class="flex flex-col w-full place-content-center place-items-center gap-y-5"
      >
        <div
          class="w-full grid grid-cols-1 md:grid-cols-2 place-content-center gap-y-2 gap-x-12"
        >
          <div class="flex flex-col gap-y-6">
            <h2 class="text-3xl font-bold">Main</h2>

            <div class="w-full flex flex-col gap-y-6">
              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Type class="icon" />
                  <label for="title" class="text-2xl font-bold">Title</label>
                </div>
                <AppInputTextField
                  placeholder="post title"
                  fieldName="title"
                  :initialValue="initialValues.title"
                  type="text"
                  @update:modelValue="(value : string) => updateSEO(formSlot,value)"
                />
              </div>

              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <UserPen class="icon" />
                  <label for="authorUsername" class="text-2xl font-bold"
                    >Author</label
                  >
                </div>
                <AppInputTextField
                  placeholder="authorUsername"
                  fieldName="authorUsername"
                  type="text"
                  :initialValue="initialValues.authorUsername"
                />
              </div>

              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <FileText class="icon" />
                  <label for="description" class="text-2xl font-bold"
                    >Description</label
                  >
                </div>
                <AppTextAreaField
                  placeholder="Description"
                  fieldName="description"
                  :initialValue="initialValues.description"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-y-6">
            <h2 class="text-3xl font-bold">SEO</h2>

            <div class="w-full flex flex-col gap-y-6">
              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Link class="icon" />
                  <label for="seo_slug" class="text-2xl font-bold">Slug</label>
                </div>
                <AppInputTextField
                  placeholder="slug"
                  fieldName="seo_slug"
                  :initialValue="initialValues.seo_slug"
                  @update:modelValue="(value : string) => generateSeoSlug(value)"
                  type="text"
                />
              </div>
              <div
                class="flex flex-col place-content-center place-items-start gap-3"
              >
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Type class="icon" />
                  <label for="seo_metaTitle" class="text-2xl font-bold"
                    >Meta Title</label
                  >
                </div>
                <AppInputTextField
                  placeholder="metaTitle"
                  fieldName="seo_metaTitle"
                  :initialValue="initialValues.seo_metaTitle"
                  type="text"
                />
              </div>
            </div>

            <div
              class="flex flex-col place-content-center place-items-start gap-3"
            >
              <div class="flex place-content-center place-items-center gap-x-3">
                <Tags class="icon" />
                <label for="seo_keywords" class="text-2xl font-bold"
                  >Slug</label
                >
              </div>
              <AppInputArrayField
                placeholder="keywords"
                fieldName="seo_keywords"
                :initialValue="initialValues.seo_keywords"
                type="text"
              />
            </div>

            <div
              class="flex flex-col place-content-center place-items-start gap-3"
            >
              <div class="flex place-content-center place-items-center gap-x-3">
                <Globe class="icon" />
                <label for="seo_canonicalUrl" class="text-2xl font-bold"
                  >Canonical URL</label
                >
              </div>
              <AppInputTextField
                placeholder="canonicalUrl"
                fieldName="seo_canonicalUrl"
                @update:modelValue="(value : string) => generateCanonicalUrl(value)"
                :initialValue="initialValues.seo_canonicalUrl"
                type="text"
              />
            </div>

            <div
              class="flex flex-col place-content-center place-items-start gap-3"
            >
              <div class="flex place-content-center place-items-center gap-x-3">
                <FileText class="icon" />
                <label for="seo_metaDescription" class="text-2xl font-bold"
                  >Meta Description</label
                >
              </div>
              <AppTextAreaField
                placeholder="metaDescription"
                fieldName="seo_metaDescription"
                :initialValue="initialValues.seo_metaDescription"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-y-4 w-full">
          <h2 class="text-3xl font-bold">Uploads</h2>

          <div
            class="flex flex-wrap place-content-center md:place-content-between gap-12 w-full"
          >
            <MainImageUpload
              v-model:mainImage="mainImage"
              v-model:mainImageUpload="mainImageUpload"
              :postID="initialValues.id"
              :clear="clearFiles"
            />

            <div class="flex flex-wrap place-content-start gap-12">
              <div class="flex flex-col place-items-center gap-y-4">
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Files class="icon" />
                  <label for="documentIds[]" class="text-2xl font-bold"
                    >Documents</label
                  >
                </div>
                <DocumentUpload
                  v-model:files="newDocuments"
                  v-model:existingDocuments="existingDocuments"
                  v-model:available="availableDocuments"
                  v-model:removedDocuments="removedDocuments"
                  :documents="documents"
                  :postID="initialValues.id"
                  :clear="clearFiles"
                />
              </div>

              <div class="flex flex-col place-items-center gap-y-4">
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Images class="icon" />
                  <label for="imageIds[]" class="text-2xl font-bold"
                    >More images</label
                  >
                </div>

                <ImageUpload
                  v-model:files="newImages"
                  v-model:existingImages="existingImages"
                  v-model:available="availableImages"
                  v-model:removedImages="removedImages"
                  :images="images"
                  :postID="initialValues.id"
                  :clear="clearFiles"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="w-full flex place-content-center place-items-center gap-5">
          <div v-if="uploading">
            <ProgressSpinner
              style="width: 80px; height: 80px"
              strokeWidth="8"
              fill="transparent"
              animationDuration=".5s"
              aria-label="Custom ProgressSpinner"
            />
          </div>
          <template v-else>
            <slot name="buttons"> </slot>
          </template>
        </div>
      </div>
    </slot>
  </Form>
</template>
