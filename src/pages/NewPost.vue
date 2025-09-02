<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { computed, reactive, ref } from "vue";
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
import apiDocuments from "../axios/api/documents";
import FileUpload from "primevue/fileupload";
import apiImages from "../axios/api/images";
import { onBeforeRouteLeave } from "vue-router";

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
const shouldConfirmLeave = ref(true);
const filesUploaded = ref<DocumentItem[]>([]);
const fileUploadRef = ref<any>(null);

const mainImageUpload = ref<ImageItem | null>(null);
const mainImageUploadRef = ref<any>(null);
const imagesUploadRef = ref<any>(null);
const imagesUpload = ref<ImageItem[]>([]);

const mainImageLink = computed(() =>
  mainImageUpload.value ? mainImageUpload.value.url : ""
);

const mainImageLoading = ref(false);
const mainImageError = ref(false);

const imageIds = ref<string[]>([]);

const ClearDocumentUpload = () => {
  if (fileUploadRef.value) {
    fileUploadRef.value.clear();
  }
};

const ClearMainImageUpload = () => {
  if (mainImageUploadRef.value) {
    mainImageUploadRef.value.clear();
    mainImageUpload.value = null;
  }
};

const ClearImagesUpload = () => {
  if (imagesUploadRef.value) {
    imagesUploadRef.value.clear();
  }
};

const resetUploads = () => {
  filesUploaded.value = [];
  imagesUpload.value = [];
  mainImageUpload.value = null;
};

const clearAllUploads = () => {
  ClearDocumentUpload();
  ClearMainImageUpload();
  ClearImagesUpload();
  resetUploads();
};

const onUploadDocument = async (event: any) => {
  const files: File[] = event.files || event.target?.files || [];

  if (!files.length) {
    console.error("Nema fajlova u eventu  (document upload) :", event);
    return;
  }

  if (filesUploaded.value.length !== 0) {
    try {
      await apiDocuments.removeDocumentAPI(filesUploaded.value[0]);
      filesUploaded.value = [];
      ClearDocumentUpload();
    } catch (error) {
      console.error("Upload failed", error);
      ClearDocumentUpload();
    }
    console.log("after removed files", filesUploaded.value);
  }

  try {
    const { data: document } = await apiDocuments.uploadDocumentsAPI(files);

    if (document) {
      filesUploaded.value = document;
    }
  } catch (error) {
    console.error("Upload failed", error);
    ClearDocumentUpload();
  }
};

const onUploadImage = async (event: any) => {
  const files: File[] = event.files || event.target?.files;
  mainImageLoading.value = true;

  if (!files) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  try {
    const { data: image } = await apiImages.uploadMainImageAPI(files);

    if (image) {
      console.log("image uploaded", image);
      mainImageUpload.value = image;
      console.log("mainImageUpload after set:", mainImageUpload.value);
    }
  } catch (error) {
    console.error("Upload failed", error);
    ClearMainImageUpload();
  }
};

const onUploadImages = async (event: any) => {
  const files: File[] = event.files || event.target?.files;

  if (!files) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  try {
    const { data: image } = await apiImages.uploadImagesAPI(files);

    if (image) {
      console.log("imagesUpload uploaded", image);
      imagesUpload.value = image;
      console.log("imagesUpload after set:", imagesUpload.value);
    }
  } catch (error) {
    console.error("Upload failed", error);
    ClearMainImageUpload();
  }
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    showError("Creatiton failed.", 3000);
    return;
  }

  const fileIds = filesUploaded.value.map((file) => file.id);

  console.log("Form values:", values);

  let valuesToSend: PostData = { ...(values as PostData) };
  valuesToSend = {
    ...valuesToSend,
    documentIds: fileIds,
    imageIds: imageIds.value,
  };

  console.log("Form valuesToSend:", valuesToSend);

  try {
    await apiPosts.createPost(valuesToSend as PostData);
    showSuccess("Post created");
    reFetchPosts();
    goBack();

    values = initialValues;
    resetUploads();
    return;
  } catch (error) {
    showError("Creatiton failed.", 3000);
    return;
  }
};

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

const removeMainImage = async () => {
  if (mainImageUpload.value) {
    try {
      await apiImages.removeMainImageAPI(mainImageUpload.value);
    } catch (error) {
      console.error("Upload removal failed", error);
    }
  }
};

const removeImages = async () => {
  console.log("imagesUpload", imagesUpload.value);
  if (imagesUpload.value.length > 0) {
    try {
      await apiImages.removeImagesAPI(imagesUpload.value);
    } catch (error) {
      console.error("Multiple images removal failed", error);
    }
  }
};

const removeDocuments = async () => {
  if (filesUploaded.value) {
    try {
      await apiDocuments.deleteDocumentsAPI(filesUploaded.value);
    } catch (error) {
      console.error("Documents removal failed", error);
    }
  }
};

const removeAllUploads = () => {
  removeMainImage();
  removeImages();
  removeDocuments();
  clearAllUploads();
};

const checkNewPostData = () => {
  shouldConfirmLeave.value =
    filesUploaded.value.length > 0 ||
    imagesUpload.value.length > 0 ||
    mainImageUpload.value
      ? true
      : false;
};

const cancelNewPost = async () => {
  checkNewPostData();
  if (shouldConfirmLeave.value) {
    removeAllUploads();
  }
  goBack();
};

onBeforeRouteLeave((_, __, next) => {
  if (shouldConfirmLeave.value) {
    const answer = window.confirm(
      "Da li si siguran da želiš napustiti stranicu?"
    );
    if (answer) {
      removeAllUploads();
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
        <div class="flex flex-col gap-y-4">
          <span>Uploads</span>

          <div class="flex flex-col gap-y-4">
            <div class="w-sm">
              <label>Main image</label>
              <div v-if="mainImageLoading">
                <ProgressSpinner
                  style="width: 80px; height: 80px"
                  strokeWidth="8"
                  fill="transparent"
                  animationDuration=".5s"
                  aria-label="Custom ProgressSpinner"
                />
              </div>
              <img
                v-if="mainImageLink"
                :src="mainImageLink"
                alt="main-image"
                class="w-sm"
                @load="mainImageLoading = false"
                @error="
                  mainImageLoading = false;
                  mainImageError = true;
                "
              />

              <div v-if="mainImageError" class="text-red-500 text-sm">
                Failed to load image
              </div>
            </div>
            <div class="flex place-content-between">
              <FileUpload
                ref="mainImageUploadRef"
                mode="basic"
                :chooseLabel="mainImageLink ? 'Change' : 'Choose'"
                name="mainImageId"
                accept="image/jpeg"
                @select="onUploadImage($event)"
                customUpload
              />
              <Button
                v-if="mainImageLink"
                label="Clear"
                @click="ClearMainImageUpload"
              ></Button>
            </div>
          </div>

          <div>
            <label>Documents</label>
            <FileUpload
              ref="fileUploadRef"
              mode="basic"
              name="documentIds[]"
              accept="application/pdf"
              :multiple="true"
              @select="onUploadDocument($event)"
              customUpload
            />
          </div>

          <div>
            <label>More images</label>
            <FileUpload
              ref="imagesUploadRef"
              mode="basic"
              name="imageIds[]"
              accept="image/jpeg"
              :multiple="true"
              @select="onUploadImages($event)"
              customUpload
            />
          </div>
        </div>
      </div>
      <div class="w-full flex place-content-center place-items-center gap-5">
        <Button
          type="submit"
          label="Create"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />

        <Button
          @click="cancelNewPost"
          label="Cancel"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />
      </div>
    </div>
  </Form>
</template>
