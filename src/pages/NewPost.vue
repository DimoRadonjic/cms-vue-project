<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { reactive, ref } from "vue";
import z from "zod";
import { useToastService } from "../composable/toastService/AppToastService";
import apiPosts from "../axios/api/posts";
import type { DocumentItem, NewPost, PostData } from "../types/types";
import { useAppRouter } from "../composable/router/useAppRouter";
import { usePosts } from "../composable";
import apiDocuments from "../axios/api/documents";
import FileUpload from "primevue/fileupload";

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
  seo_canonicalUrl: z.string().min(1, {
    message: "seo_canonicalUrl is required.",
  }),
});

const resolver = zodResolver(schema);

const filesUploaded = ref<DocumentItem[]>([]);
const fileUpload = ref<any>(null);

const mainImageUpload = ref<any>(null);
const imagesUpload = ref<any>(null);

const imageIds = ref<string[]>([]);

const ClearDocumentUpload = () => {
  if (fileUpload.value) {
    fileUpload.value.clear();
  }
};

// const ClearMainImageUpload = () => {
//   if (mainImageUpload.value) {
//     mainImageUpload.value.clear();
//   }
// };

// const ClearImagesUpload = () => {
//   if (imagesUpload.value) {
//     imagesUpload.value.clear();
//   }
// };

const resetUploads = () => {
  filesUploaded.value = [];
  imageIds.value = [];
  mainImageUpload.value = null;
};

const onUpload = async (event: any) => {
  const files: File[] = event.files || event.target?.files || [];

  if (!files.length) {
    console.error("Nema fajlova u eventu:", event);
    return;
  }

  console.log("removed files", filesUploaded.value);

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
    console.log("Uploading files", files);
    const { data: document } = await apiDocuments.uploadDocumentsAPI(files);
    console.log("Upload uspješan, documentIds:", document);

    if (document) {
      filesUploaded.value = document;
    }
  } catch (error) {
    console.error("Upload failed", error);
    ClearDocumentUpload();
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

    seo_keywords: values.seo_keywords.split(",").map((v: any) => v.trim()),
  };

  console.log("Form values:", valuesToSend);

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
        <div>
          <span>Uploads</span>

          <div>
            <label>Main image</label>
            <FileUpload
              ref="mainImageUpload"
              mode="basic"
              name="mainImageId"
              url="/api/upload"
              accept="image/*"
            />
          </div>

          <div>
            <label>Documents</label>
            <FileUpload
              ref="fileupload"
              mode="basic"
              name="documentIds[]"
              accept="application/pdf"
              :multiple="true"
              @select="onUpload($event)"
              customUpload
            />
          </div>

          <div>
            <label>More images</label>
            <FileUpload
              ref="imagesUpload"
              mode="basic"
              name="imageIds[]"
              url="/api/upload"
              accept="image/jpeg"
              :multiple="true"
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
          @click="goBack()"
          label="Cancel"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />
      </div>
    </div>
  </Form>
</template>
