<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { computed, reactive, ref } from "vue";
import z from "zod";
import { useToastService } from "../composable/toastService/AppToastService";
import apiPosts from "../axios/api/posts";
import type { NewPost, PostData } from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";
import FileUpload from "primevue/fileupload";
import { onBeforeRouteLeave } from "vue-router";
import { ImagePlus } from "lucide-vue-next";
import apiImages from "../axios/api/images";
import apiDocuments from "../axios/api/documents";

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
const shouldConfirmLeave = ref(false);
const filesUploaded = ref<File[]>([]);

const mainImageUpload = ref<any>();

const imagesUpload = ref<File[]>([]);

const fileUploadRef = ref();
const mainImageUploadRef = ref();
const imagesUploadRef = ref();

const imagesUploading = ref<boolean>(false);
const imagesError = ref(false);

const documentsUploading = ref<boolean>(false);
const documentError = ref(false);

const mainImageLoading = ref<boolean>(false);
const mainImageError = ref<boolean>(false);
const uploading = ref<boolean>(false);

const mainImageLink = computed(() => {
  return mainImageUpload.value
    ? URL.createObjectURL(mainImageUpload.value)
    : "";
});

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

const onUploadDocument = async (event: any) => {
  const files: File[] = event.files || event.target?.files || [];

  if (!files.length) {
    console.error("Nema fajlova u eventu  (document upload) :", event);
    return;
  }

  documentsUploading.value = true;
  filesUploaded.value = files;

  documentsUploading.value = false;
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

  mainImageLoading.value = false;
};

const onUploadImages = async (event: any) => {
  const files: File[] = event.files || event.target?.files;

  imagesUploading.value = true;

  if (!files) {
    console.error("Nema fajlova u eventu (image upload):", event);
    return;
  }

  imagesUpload.value = files;

  imagesUploading.value = false;
};

const createLink = (file: File) => {
  return URL.createObjectURL(file);
};

const ClearDocumentUpload = () => {
  fileUploadRef.value?.clear();
  filesUploaded.value = [];
  documentError.value = false;
};

const ClearMainImageUpload = () => {
  mainImageUploadRef.value?.clear();
  mainImageUpload.value = null;
  mainImageError.value = false;
};

const ClearImagesUpload = () => {
  imagesUploadRef.value?.clear();
  imagesUpload.value = [];
  imagesError.value = false;
};

const resetUploads = () => {
  ClearDocumentUpload();
  ClearMainImageUpload();
  ClearImagesUpload();
};

const checkNewPostData = () => {
  shouldConfirmLeave.value =
    filesUploaded.value.length > 0 ||
    imagesUpload.value.length > 0 ||
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

      const { fileIds, imageIds, mainImageID } = await uploadAll(
        filesUploaded.value,
        imagesUpload.value,
        mainImageUpload.value,
        id
      );

      console.log("fileIds", fileIds);
      console.log("imageIds", imageIds);

      if (mainImageID) {
        console.log("mainImageID", mainImageID);
        console.log("update", {
          ...res.data,

          mainImageId: mainImageID,
        });

        await apiPosts.updatePost({
          ...res.data,

          mainImageId: mainImageID,
        } as PostData);
      }

      console.log("valuesToSend", valuesToSend);
    }

    if (!uploading.value) {
      showSuccess("Post created");
      reFetchPosts();
      goBack();
      values = initialValues;
      resetUploads();
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
                  v-if="!mainImageUpload && !mainImageLoading"
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
              <Button
                v-if="mainImageLink"
                label="Clear"
                :disabled="uploading"
                @click="ClearMainImageUpload"
              ></Button>
            </div>
          </div>

          <div class="flex gap-x-12">
            <div class="flex flex-col gap-y-4">
              <label>Documents</label>

              <div v-if="documentError" class="text-red-500 text-sm">
                Failed to upload documents
              </div>

              <div
                v-if="filesUploaded.length > 0"
                v-for="document in filesUploaded"
              >
                <div class="flex gap-x-4 place-items-center">
                  <i class="pi pi-file-pdf" />
                  <a :href="createLink(document)" target="_blank">
                    <h3>{{ document.name }}</h3>
                  </a>
                </div>
              </div>

              <div v-if="filesUploaded.length === 0 && !documentsUploading">
                <h3>No file chosen</h3>
              </div>

              <div class="flex gap-x-5">
                <FileUpload
                  ref="fileUploadRef"
                  mode="basic"
                  name="documentIds[]"
                  accept="application/pdf"
                  :chooseLabel="filesUploaded.length > 0 ? 'Change' : 'Choose'"
                  :multiple="true"
                  :auto="true"
                  @select="onUploadDocument($event)"
                  customUpload
                  :disabled="uploading"
                />
                <Button
                  v-if="filesUploaded.length > 0"
                  label="Clear"
                  :disabled="uploading"
                  @click="ClearDocumentUpload"
                ></Button>
              </div>
            </div>

            <div class="flex flex-col gap-y-4">
              <label>More images</label>

              <div v-if="imagesError" class="text-red-500 text-sm">
                Failed to upload images
              </div>

              <div v-if="imagesUpload.length > 0" v-for="image in imagesUpload">
                <div class="flex gap-x-4 place-items-center">
                  <i class="pi pi-image" />
                  <a :href="createLink(image)" target="_blank">
                    <h3>{{ image.name }}</h3>
                  </a>
                </div>
              </div>

              <div v-if="imagesUpload.length === 0 && !imagesUploading">
                <h3>No file chosen</h3>
              </div>

              <div class="flex gap-x-5">
                <FileUpload
                  ref="imagesUploadRef"
                  mode="basic"
                  name="imageIds[]"
                  accept="image/jpeg"
                  :chooseLabel="imagesUpload.length > 0 ? 'Change' : 'Choose'"
                  :multiple="true"
                  :auto="true"
                  @select="onUploadImages($event)"
                  customUpload
                  :disabled="uploading"
                />
                <Button
                  v-if="imagesUpload.length > 0"
                  label="Clear"
                  :disabled="uploading"
                  @click="ClearImagesUpload"
                ></Button>
              </div>
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
            @click="goBack"
            label="Cancel"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          />
        </template>
      </div>
    </div>
  </Form>
</template>
