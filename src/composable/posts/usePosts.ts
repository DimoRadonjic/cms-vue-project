import { ref, watch } from "vue";
import type { PostData, StorageData } from "../../types/types";
import apiPosts from "../../axios/api/posts";
import { useToastService } from "../toastService/AppToastService";
import { useSessionStorage } from "../sessionStorage/useSessionStorage";

export const usePosts = () => {
  const { showError, showSuccess } = useToastService();
  const { getItem, setItem } = useSessionStorage();
  const storageData = getItem<StorageData>("data");

  const posts = ref<PostData[]>(storageData?.data || []);
  const loading = ref<boolean>(false);
  const error = ref<Error>();

  const fetchPosts = async () => {
    loading.value = true;
    try {
      const res = await apiPosts.getPosts();

      if (res) {
        posts.value = res;
        setItem("data", { dataType: "posts", data: posts.value });
        loading.value = false;
      }
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
      setItem("data", { dataType: "posts", data: posts.value });

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
