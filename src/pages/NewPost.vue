<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { reactive, ref } from "vue";
import z from "zod";
import { useToastService } from "../composable/toastService/AppToastService";
import apiPosts from "../axios/api/posts";
import type {
  DocumentItem,
  ImageItem,
  NewPost,
  PostData,
} from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";
import { onBeforeRouteLeave } from "vue-router";
import apiImages from "../axios/api/images";
import apiDocuments from "../axios/api/documents";
import DocumentUpload from "../components/file-upload/DocumentUpload.vue";
import ImageUpload from "../components/image-upload/ImageUpload.vue";
import MainImageUpload from "../components/image-upload/mainImageUpload.vue";

const BASE_URL = "https://www.example.com/";

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

const { showError, showSuccess } = useToastService();

const { goBack } = useAppRouter();

const { reFetchPosts } = usePosts();

const canonicalUrlSchema = z
  .string()
  .min(1, { message: "Canonical URL cannot be empty." })
  .refine((val) => val.startsWith(BASE_URL), {
    message: `Canonical URL must start with ${BASE_URL}`,
  })
  .refine((val) => val !== BASE_URL, {
    message: "Canonical URL cannot be just the base URL, slug is required.",
  })
  .transform((val) => {
    // ukloni višestruke BASE_URL ako slučajno postoje
    const slug = val.replace(new RegExp(`^(${BASE_URL})+`), "");
    return `${BASE_URL}${slug}`;
  });

const schema = z.object({
  title: z.string().min(1, {
    message: "title is required.",
  }),

  description: z.string().min(1, {
    message: "description is required.",
  }),
  authorUsername: z.string().min(1, {
    message: "authorUsername is required.",
  }),

  seo_slug: z.string().min(1, {
    message: "seo_slug is required.",
  }),
  seo_metaTitle: z.string().min(1, {
    message: "seo_metaTitle is required.",
  }),
  seo_metaDescription: z.string().min(1, {
    message: "seo_metaDescription is required.",
  }),
  seo_keywords: z.string().min(1, {
    message: "seo_keywords is required.",
  }),
  seo_canonicalUrl: canonicalUrlSchema,
});

const resolver = zodResolver(schema);
const shouldConfirmLeave = ref<boolean>(false);
const clearUploads = ref<boolean>(false);
const filesUploaded = ref<File[]>([]);

const mainImageUpload = ref<any>();

const imagesUpload = ref<File[]>([]);
const existingImages = ref<ImageItem[]>([]);
const existingDocuments = ref<DocumentItem[]>([]);
const mainImage = ref<ImageItem>();

const mainImageUploadRef = ref();

const imagesError = ref(false);

const documentError = ref(false);

const mainImageLoading = ref<boolean>(false);
const mainImageError = ref<boolean>(false);
const uploading = ref<boolean>(false);

const generateSeoSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateKeywords = (value: string) => {
  return value
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2)
    .join(", ");
};

const generateCanonicalUrl = (value: string) => {
  const cleanSlug = value.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

  return `${BASE_URL}${cleanSlug}`;
};

const generateMetaDescription = (title: string) => {
  return title ? `Read more about ${title}` : "";
};

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

const ClearMainImageUpload = () => {
  mainImageUploadRef.value?.clear();
  mainImageUpload.value = null;
  mainImageError.value = false;
};

const resetUploads = () => {
  clearUploads.value = true;
  ClearMainImageUpload();
};

const checkNewPostData = () => {
  shouldConfirmLeave.value =
    filesUploaded.value.length > 0 ||
    imagesUpload.value.length > 0 ||
    existingDocuments.value.length > 0 ||
    existingImages.value.length > 0 ||
    mainImageUpload.value
      ? true
      : false;
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

const uploadAll = async (
  files: File[],
  images: File[],
  mainImage: File | null,
  post_id: string
) => {
  uploading.value = true;
  const [docsResult, imagesResult, mainImageResult] = await Promise.allSettled([
    uploadDocuments(files, post_id),
    uploadImages(images, post_id),
    mainImage ? uploadMainImage(mainImage, post_id) : Promise.resolve(null),
  ]);

  const result: {
    fileIds: number[];
    imageIds: string[];
    mainImageID: string | null;
  } = {
    fileIds: [],
    imageIds: [],
    mainImageID: null,
  };

  // dokumenti
  if (docsResult.status === "fulfilled" && docsResult.value) {
    result.fileIds = docsResult.value;
  } else {
    documentError.value = true;
  }

  // slike
  if (imagesResult.status === "fulfilled" && imagesResult.value) {
    result.imageIds = imagesResult.value;
  } else {
    imagesError.value = true;
  }

  // glavna slika
  if (mainImageResult.status === "fulfilled" && mainImageResult.value) {
    result.mainImageID = mainImageResult.value.id;
  } else {
    mainImageError.value = true;
  }

  uploading.value = false;

  return result;
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    showError("Creatiton failed.", new Error("Invalid fields"), 3000);
    return;
  }

  let valuesToSend: PostData = { ...(values as PostData) };

  try {
    const res = await apiPosts.createPost(valuesToSend as PostData);

    if (res && res.data) {
      const { id } = res.data;

      const { mainImageID } = await uploadAll(
        filesUploaded.value,
        imagesUpload.value,
        mainImageUpload.value,
        id
      );

      if (existingDocuments.value.length > 0) {
        const linked = existingDocuments.value.map(({ id }) => Number(id));

        await apiDocuments.addPostDocumentsAPI(linked, id);
      }

      if (existingImages.value.length > 0) {
        const linked = existingImages.value.map(({ id }) => id);

        await apiImages.addPostImagesAPI(linked, id);
      }
      if (mainImageID) {
        await apiPosts.updatePost({
          ...res.data,

          mainImageId: mainImageID,
        } as PostData);
      }
    }

    if (!uploading.value) {
      showSuccess("Post created");
      reFetchPosts();
      goBack();
      values = initialValues;
      resetUploads();
      clearUploads.value = false;
    }
  } catch (error: any) {
    const detail = new Error(error.message);
    showError("Creatiton failed.", detail, 3000);
  }
};

onBeforeRouteLeave((_, __, next) => {
  checkNewPostData();

  if (shouldConfirmLeave.value) {
    const answer = window.confirm(
      "Da li si siguran da želiš napustiti stranicu?"
    );
    if (answer) {
      resetUploads();
      next();
    } else next(false);
  } else {
    next();
  }
});
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
    class="flex flex-col gap-8 bg-primary w-fit mx-auto backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
  >
    <h1
      class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
    >
      New Post
    </h1>

    <div
      class="flex flex-col w-full place-content-center place-items-center gap-y-5"
    >
      <div class="w-full flex flex-wrap place-content-center gap-y-2 gap-x-12">
        <div class="w-full max-w-fit flex flex-col gap-y-2">
          <span>Main</span>

          <div class="w-full max-w-fit flex flex-col gap-y-2">
            <AppInputTextField
              placeholder="Title"
              fieldName="title"
              initialValue=""
              type="text"
              @update:modelValue="(value : string) => updateSEO(formSlot,value)"
            />

            <AppInputTextField
              placeholder="authorUsername"
              fieldName="authorUsername"
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

        <div class="w-md flex flex-col gap-y-2">
          <span>SEO</span>

          <div class="w-full flex flex-col gap-y-2">
            <AppInputTextField
              placeholder="slug"
              fieldName="seo_slug"
              initialValue=""
              @update:modelValue="(value : string) => generateSeoSlug(value)"
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
              @update:modelValue="(value : string) => generateCanonicalUrl(value)"
              :initialValue="BASE_URL"
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
      <div class="flex flex-col gap-y-4 w-full">
        <span>Uploads</span>

        <div class="flex place-content-between gap-x-12 w-full">
          <div class="flex flex-col gap-y-4">
            <div>
              <label>Main image</label>

              <MainImageUpload
                v-model:mainImage="mainImage"
                v-model:mainImageUpload="mainImageUpload"
              />
            </div>
          </div>

          <div class="flex gap-x-12">
            <div class="flex flex-col gap-y-4">
              <label>Documents</label>

              <DocumentUpload
                v-model:files="filesUploaded"
                v-model:existingDocuments="existingDocuments"
              />
            </div>

            <div class="flex flex-col gap-y-4">
              <label>More images</label>
              <ImageUpload
                v-model:files="imagesUpload"
                v-model:existingImages="existingImages"
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
          <Button
            type="submit"
            label="Create"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            :disabled="uploading"
          />

          <Button
            @click="goBack()"
            label="Cancel"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          />
        </template>
      </div>
    </div>
  </Form>
</template>
