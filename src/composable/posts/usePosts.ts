import { ref, watch } from "vue";
import type { PostData, StorageData } from "../../types/types";
import apiPosts from "../../backend/api/posts";
import { useToastService } from "../toastService/AppToastService";
import { useLocalStorage } from "../localStorage/useLocalStorage";

export const usePosts = () => {
  const { showError, showSuccess } = useToastService();
  const { getItem, watchEffectStorageItem, setItem } = useLocalStorage();
  const storageData = getItem<StorageData>("data");

  const posts = ref<PostData[]>(storageData?.data || []);
  const loading = ref<boolean>(false);
  const error = ref<Error>();

  const fetchPosts = async () => {
    loading.value = true;
    try {
      const res = await apiPosts.getPosts();

      setTimeout(() => {
        posts.value = res;
        setItem("data", { dataType: "posts", data: posts.value });
        loading.value = false;
      }, 10000);
    } catch (apiError) {
      console.error("Failed to fetch posts:", apiError);
      showError("Failed to fetch posts. Please try again later.", apiError);
      loading.value = false;
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
    }
  };

  if (!posts.value.length || storageData?.dataType !== "posts") {
    posts.value = [];

    fetchPosts();
  }

  const reFetchPosts = async () => {
    try {
      posts.value = [];
      await fetchPosts();

      showSuccess("Posts refreshed successfully");
    } catch (apiError) {
      console.error("Failed to re-fetch posts:", apiError);
      showError("Failed to refresh posts. Please try again later.", apiError);
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
    }
  };

  const searchPosts = async (query: string) => {
    loading.value = true;
    try {
      const res = await apiPosts.searchPosts(query);
      // posts.value = res;
      console.log("Search results:", res);
      loading.value = false;
    } catch (apiError) {
      console.error("Failed to search posts:", apiError);
      showError("Failed to search posts. Please try again later.", apiError);
      loading.value = false;
      error.value =
        apiError instanceof Error ? apiError : new Error("An error occurred");
    }
  };

  const onFetched = (callback: (data: PostData[]) => void) => {
    watch(
      posts,
      (val) => {
        if (val.length) {
          callback(val);
        }
      },
      { immediate: false }
    );
  };

  watchEffectStorageItem<StorageData>("data", {
    dataType: "posts",
    data: posts.value,
  });

  return {
    posts,
    fetchPosts,
    reFetchPosts,
    loading,
    error,
    onFetched,
    searchPosts,
  };
};
