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
import FileUpload from "primevue/fileupload";
import {
  Files,
  FileText,
  Globe,
  ImagePlus,
  Images,
  Link,
  Tags,
  Type,
  UserPen,
  Wallpaper,
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

const mainImageUpload = ref<any>({ ...props.data.mainImage });

const documents = ref<DocumentItem[]>([...props.data.documents]);
const newDocuments = ref<File[]>([]);
const existingDocuments = ref<DocumentItem[]>([]);
const removedDocuments = ref<DocumentItem[]>([]);

const images = ref<ImageItem[]>([...props.data.images]);
const newImages = ref<File[]>([]);
const existingImages = ref<ImageItem[]>([]);
const removedImages = ref<ImageItem[]>([]);

const fileUploadRef = ref();
const mainImageUploadRef = ref();
const imagesUploadRef = ref();

const imagesError = ref(false);

const documentError = ref(false);

const mainImageLoading = ref<boolean>(false);
const mainImageError = ref<boolean>(false);
const uploading = ref<boolean>(false);

const mainImageLink = computed(() => {
  return mainImageUpload.value
    ? mainImageUpload.value instanceof File
      ? URL.createObjectURL(mainImageUpload.value)
      : mainImageUpload.value.url
    : null;
});

const filesLength = computed(
  () =>
    !isEqual(existingDocuments.value, initialValues.documents) ||
    !isEqual(existingImages.value, initialValues.images) ||
    removedImages.value.length > 0 ||
    removedDocuments.value.length > 0 ||
    newImages.value.length > 0 ||
    newDocuments.value.length > 0
);

watch(
  () => filesLength.value,
  () =>
    filesLength.value
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

const onUploadImage = async (event: any) => {
  const files: File[] = event.files || event.target?.files;

  console.log("files", files);
  mainImageLoading.value = true;

  if (!files) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  mainImageUpload.value = files[0];

  console.log("new file", mainImageUpload.value);

  mainImageLoading.value = false;
};

const ClearDocumentUpload = () => {
  fileUploadRef.value?.clear();
  documents.value = [];
  documentError.value = false;
};

const ClearMainImageUpload = () => {
  mainImageUploadRef.value?.clear();
  mainImageUpload.value = null;
  mainImageError.value = false;
};

const ClearImagesUpload = () => {
  imagesUploadRef.value?.clear();
  images.value = [];
  imagesError.value = false;
};

const resetUploads = () => {
  ClearDocumentUpload();
  ClearMainImageUpload();
  ClearImagesUpload();
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

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  const {
    documents: initialDocuments,
    images: initalImages,
    mainImage,
    ...rest
  } = initialValues;

  const { id, ...postValues } = rest;

  console.log("rest", postValues);
  console.log("values", values);

  console.log("removed", removedDocuments.value);
  console.log("newImages", newImages.value);
  console.log("removed images", removedImages.value);

  console.log("nizov", isEqual(existingDocuments.value, initialDocuments));

  const same =
    isEqual(postValues, values) &&
    isEqual(existingDocuments.value, initialDocuments) &&
    newDocuments.value.length !== 0 &&
    newImages.value.length !== 0 &&
    isEqual(existingDocuments.value, initialDocuments) &&
    isEqual(existingImages.value, initalImages);

  console.log("same", same);

  if (same) {
    showError("Update failed.", new Error("Nothing changed."), 3000);
    return;
  }

  values = { ...rest, ...values };

  console.log("values", values);

  if (!valid) {
    showError("Update failed.", new Error("Invalid fields"), 3000);
    return;
  }

  if (removedDocuments.value.length > 0) {
    console.log("removing 1");
    const docIds = removedDocuments.value.map(({ id }) => Number(id));
    try {
      await apiDocuments.removePostDocumentAPI(docIds, id);
    } catch (error) {
      console.error(error);
    }
  }

  if (removedImages.value.length > 0) {
    console.log("removing 2");
    const imgIds = removedImages.value.map(({ id }) => id);
    try {
      await apiImages.removePostImagesAPI(imgIds, id);
    } catch (error) {
      console.error(error);
    }
  }

  let valuesToSend: PostData = { ...(values as PostData) };

  if (mainImageUpload.value[0] && !mainImageUpload.value[0].id) {
    emit("uploading-change", uploading.value);

    const mainImageRes: ImageItem | null | undefined = await uploadMainImage(
      mainImageUpload.value,
      values.id
    );
    console.log("mainImage await", mainImageRes);
    if (mainImageRes) {
      valuesToSend.mainImageId = mainImageRes.id;
    }
  }

  if (newDocuments.value.length > 0) {
    emit("uploading-change", uploading.value);

    const fileIds = await uploadDocuments(newDocuments.value, id);

    console.log("fileIds await", fileIds);
  }

  if (newImages.value.length > 0) {
    emit("uploading-change", uploading.value);

    const imageIds = await uploadImages(newImages.value, id);
    console.log("imageIds await", imageIds);
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

  console.log("valuesToSend", valuesToSend);

  try {
    await apiPosts.updatePost(valuesToSend as PostData);

    if (!uploading.value) {
      showSuccess("Post updated");
      reFetchPosts();
      goBack();
      resetForm();
      resetUploads();
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

  resetUploads();

  console.log("Forma je resetovana");
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
    class="flex flex-col gap-8"
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

          <div class="flex place-content-between gap-x-12 w-full">
            <div class="flex flex-col gap-y-4">
              <div>
                <div
                  class="flex place-content-center place-items-center gap-x-3"
                >
                  <Wallpaper class="icon" />
                  <label for="mainImageId" class="text-2xl font-bold"
                    >Main image</label
                  >
                </div>

                <div class="h-[300px] w-fit">
                  <img
                    v-if="mainImageLink"
                    :src="mainImageLink"
                    alt="main-image"
                    class="w-sm object-cover h-full"
                    @load="mainImageLoading = false"
                    @error="
                      mainImageLoading = false;
                      mainImageError = true;
                    "
                  />

                  <div
                    v-if="
                      (!mainImageUpload && !mainImageLoading) || !mainImageLink
                    "
                    class="mt-4 relative w-full h-full"
                  >
                    <ImagePlus class="w-full h-full z-10" />

                    <FileUpload
                      ref="mainImageUploadRef"
                      mode="basic"
                      :chooseLabel="mainImageLink ? 'Change' : 'Choose'"
                      class="!absolute top-0 w-full h-full !opacity-0 !z-0"
                      name="mainImageId"
                      accept="image/jpeg"
                      @select="onUploadImage($event)"
                      :auto="true"
                      customUpload
                      :disabled="uploading"
                    />
                  </div>
                </div>

                <div v-if="mainImageError" class="text-red-500 text-sm">
                  Failed to load image
                </div>
              </div>

              <div class="flex place-content-between">
                <FileUpload
                  v-if="mainImageUpload"
                  ref="mainImageUploadRef"
                  mode="basic"
                  :chooseLabel="mainImageLink ? 'Change' : 'Choose'"
                  name="mainImageId"
                  accept="image/jpeg"
                  @select="onUploadImage($event)"
                  :auto="true"
                  customUpload
                  :disabled="uploading"
                />
                <Button
                  v-if="mainImageLink"
                  label="Clear"
                  :disabled="uploading"
                  @click="ClearMainImageUpload"
                ></Button>
              </div>
            </div>

            <div class="flex gap-x-12">
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
                  :documents="documents"
                  :postID="initialValues.id"
                  v-model:removedDocuments="removedDocuments"
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
                  :images="images"
                  :postID="initialValues.id"
                  v-model:removedImages="removedImages"
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
