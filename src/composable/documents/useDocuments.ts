import { ref, watch } from "vue";
import { useStorage } from "../storage";
import { useToastService } from "../toastService/AppToastService";
import apiDocuments from "../../axios/api/documents";
import type { DocumentItem, StorageData } from "../../types/types";

export const useDocuments = () => {
  const { showError, showSuccess } = useToastService();
  const { getSessionItem, setSessionItem } = useStorage();

  const storageData = getSessionItem<StorageData>("data");

  const data = ref(storageData?.data || []);
  const loading = ref<boolean>(false);
  const uploading = ref<boolean>(false);
  const error = ref<Error>();

  const fetch = async () => {
    loading.value = true;
    try {
      const { data: resData } = await apiDocuments.getDocumentsAPI();

      if (data) {
        data.value = resData;

        setSessionItem("data", { dataType: "documents", data: data.value });
      }

      loading.value = false;
    } catch (apiError: any) {
      console.error("Failed to fetch posts:", apiError);
      showError("Failed to fetch posts. Please try again later.", apiError);
      loading.value = false;
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
    }
  };

  if (!data.value.length || storageData?.dataType !== "documents") {
    data.value = [];

    fetch();
  }

  const reFetch = async () => {
    try {
      data.value = [];
      await fetch();

      showSuccess("Documents refreshed successfully");
    } catch (apiError: any) {
      console.error("Failed to re-fetch documents:", apiError);
      const detail = new Error(apiError.message);
      showError("Failed to refresh documents. Please try again later.", detail);
    }
  };

  const searchPosts = async () => {
    loading.value = true;
    // try {
    //   const res = await apiDocuments.searchPosts(query);
    //   // posts.value = res;
    //   console.log("Search results:", res);
    //   loading.value = false;
    // } catch (apiError) {
    //   console.error("Failed to search posts:", apiError);
    //   showError("Failed to search posts. Please try again later.", apiError);
    //   loading.value = false;
    //   error.value =
    //     apiError instanceof Error ? apiError : new Error("An error occurred");
    // }
  };

  const onFetched = (callback: (data: any[]) => void) => {
    watch(
      data,
      (val) => {
        if (val.length) {
          callback(val);
        }
      },
      { immediate: false }
    );
  };

  const uploadDocuments = async (documents: File[], post_id: string) => {
    loading.value = true;

    try {
      const res = await apiDocuments.uploadDocumentsAPI(documents, post_id);
      loading.value = false;

      return res;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Failed to upload document. Please try again later.", detail);
    }
  };

  const deleteDocuments = async (documents: DocumentItem[]) => {
    loading.value = true;

    try {
      const res = await apiDocuments.deleteDocumentsAPI(documents);
      loading.value = false;

      return res;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Failed to delete document. Please try again later.", detail);
    }
  };

  return {
    data,
    fetch,
    reFetch,
    loading,
    error,
    onFetched,
    searchPosts,
    uploading,
    uploadDocuments,
    deleteDocuments,
  };
};
