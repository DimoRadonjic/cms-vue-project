import { ref, watch } from "vue";
import { useLocalStorage } from "../localStorage/useLocalStorage";
import { useToastService } from "../toastService/AppToastService";
import apiDocuments from "../../backend/api/documents";
import type { StorageData } from "../../types/types";

export const useDocuments = () => {
  const { showError, showSuccess } = useToastService();
  const { getItem, watchEffectStorageItem, setItem } = useLocalStorage();

  const storageData = getItem<StorageData>("data");

  const data = ref(storageData?.data || []);
  const loading = ref<boolean>(false);
  const error = ref<Error>();

  const fetch = async () => {
    loading.value = true;
    try {
      const res = await apiDocuments.getDocuments();

      data.value = res;

      setItem("data", { dataType: "documents", data: data.value });

      loading.value = false;
    } catch (apiError) {
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
      await fetch();

      showSuccess("Posts refreshed successfully");
    } catch (apiError) {
      console.error("Failed to re-fetch posts:", apiError);
      showError("Failed to refresh posts. Please try again later.", apiError);
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
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

  watchEffectStorageItem<StorageData>("data", {
    dataType: "documents",
    data: data.value,
  });

  return {
    data,
    fetch,
    reFetch,
    loading,
    error,
    onFetched,
    searchPosts,
  };
};
