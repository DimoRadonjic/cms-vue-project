<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import apiDocuments from "../axios/api/documents";
import type { DocumentItem } from "../types/types";

const { getRouteID } = useAppRouter();
const id = getRouteID();
const documentByAPI = ref<DocumentItem | null>(null);

onMounted(async () => {
  try {
    const { data } = await apiDocuments.getDocumentByIDAPI(id);
    if (data) {
      documentByAPI.value = data;
    }
  } catch (error) {}
});

const isLoading = ref(true);
const showError = ref(false);

const onPdfLoad = () => {
  isLoading.value = false;
  showError.value = false;
};

const onPdfError = () => {
  isLoading.value = false;
  showError.value = true;
};

const openInNewTab = () => {
  if (documentByAPI.value) {
    window.open(documentByAPI.value.url, "_blank");
  }
};

const downloadPdf = () => {
  if (documentByAPI.value) {
    const link = document.createElement("a");
    link.href = documentByAPI.value.url;
    link.download = `${documentByAPI.value.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <ProgressSpinner
          style="width: 80px; height: 80px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
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

      <div v-if="showError" class="error-message">
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
      <button
        @click="openInNewTab"
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
      >
        Otvori u novom tab-u
      </button>
      <button
        @click="downloadPdf"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Download PDF
      </button>
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
