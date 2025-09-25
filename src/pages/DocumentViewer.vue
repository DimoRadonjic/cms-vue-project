<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import apiDocuments from "../axios/api/documents";
import type { DocumentItem } from "../types/types";
import AppButton from "../components/ui/AppButton.vue";
import { useToastService } from "../composable/toastService/AppToastService";
import AppSpinner from "../components/AppSpinner.vue";

const { getRouteID } = useAppRouter();
const { showError } = useToastService();
const id = getRouteID();
const documentByAPI = ref<DocumentItem | null>(null);

onMounted(async () => {
  try {
    const { data } = await apiDocuments.getDocumentByIDAPI(Number(id));
    if (data) {
      documentByAPI.value = data;
    }
  } catch (error: any) {
    console.error(error.message);
    showError("Failed to fetch the document", error.message);
  }
});

const isLoading = ref(true);
const error = ref(false);

const onPdfLoad = () => {
  isLoading.value = false;
  error.value = false;
};

const onPdfError = () => {
  isLoading.value = false;
  error.value = true;
};

const openInNewTab = () => {
  if (documentByAPI.value) {
    window.open(documentByAPI.value.url, "_blank");
  }
};
</script>

<template>
  <div
    class="w-full h-full flex place-content-center flex-col place-items-center p-4"
  >
    <h2 class="text-2xl font-bold mb-4 text-center">
      {{ documentByAPI?.title }}
    </h2>
    <div v-if="isLoading">
      <div
        class="flex place-content-center place-items-center w-full h-full text-3xl"
      >
        <AppSpinner />
      </div>
    </div>
    <div class="pdf-container">
      <iframe
        :src="documentByAPI?.url"
        height="100%"
        width="100%"
        frameborder="0"
        @load="onPdfLoad"
        @error="onPdfError"
      ></iframe>

      <div v-if="error" class="error-message">
        <p>Ne mogu da učitam PDF dokument.</p>
        <a :href="documentByAPI?.url" target="_blank" class="download-link">
          Klikni ovde za download
        </a>
      </div>

      <div v-if="isLoading" class="loading-message">
        <p>Učitavam PDF...</p>
      </div>
    </div>

    <div class="pdf-controls mt-4">
      <AppButton
        label="Open in new tab"
        type="button"
        :clickEvent="openInNewTab"
      />
    </div>
  </div>
</template>

<style scoped>
.pdf-container {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  max-height: 800px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-message,
.loading-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-link {
  color: #3b82f6;
  text-decoration: underline;
  display: inline-block;
  margin-top: 10px;
}

.download-link:hover {
  color: #1d4ed8;
}

.pdf-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .pdf-container {
    height: 60vh;
    min-height: 400px;
  }

  .pdf-controls {
    flex-direction: column;
    align-items: center;
  }

  .pdf-controls button {
    width: 200px;
  }
}
</style>
