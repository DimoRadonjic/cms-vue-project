<template>
  <div
    class="w-full h-full flex place-content-center flex-col place-items-center p-4"
  >
    <h2 class="text-2xl font-bold mb-4 text-center">{{ document.title }}</h2>

    <div class="pdf-container">
      <iframe
        :src="document.url"
        height="100%"
        width="100%"
        frameborder="0"
        @load="onPdfLoad"
        @error="onPdfError"
      ></iframe>

      <div v-if="showError" class="error-message">
        <p>Ne mogu da učitam PDF dokument.</p>
        <a :href="document.url" target="_blank" class="download-link">
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

<script setup>
import { ref, computed } from "vue";

const document = ref({
  id: "3",
  title: "Test PDF Document",
  url: "https://pdfobject.com/pdf/sample.pdf",
  blogIds: [4],
  createdAt: "2025-05-15T14:20:00Z",
  updatedAt: "2025-05-15T15:00:00Z",
});
const isLoading = ref(true);
const showError = ref(false);

const pdfUrl = computed(() => {
  const baseUrl = document.value.url;
  return `${baseUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`;
});

const onPdfLoad = () => {
  isLoading.value = false;
  showError.value = false;
};

const onPdfError = () => {
  isLoading.value = false;
  showError.value = true;
};

const openInNewTab = () => {
  window.open(document.value.url, "_blank");
};

const downloadPdf = () => {
  const link = document.createElement("a");
  link.href = document.value.url;
  link.download = `${document.value.title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

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
