import { ref, watch } from "vue";
import type { PostWithContent, StorageData } from "../../types/types";
import apiPosts from "../../axios/api/posts";
import { useToastService } from "../toastService/AppToastService";
import { useStorage } from "../storage";

export const usePosts = () => {
  const { showError, showSuccess } = useToastService();
  const { getSessionItem, setSessionItem } = useStorage();
  const storageData = getSessionItem<StorageData>("data");

  const posts = ref<PostWithContent[]>(storageData?.data ?? []);
  const loading = ref<boolean>(false);
  const error = ref<Error>();

  const fetchPosts = async () => {
    loading.value = true;
    try {
      const res = await apiPosts.getPosts();

      if (res) {
        posts.value = res as unknown as PostWithContent[];
        setSessionItem("data", { dataType: "posts", data: posts.value });
      }
      loading.value = false;
    } catch (apiError) {
      console.error("Failed to fetch posts:", apiError);
      showError("Failed to fetch posts. Please try again later.", apiError);
      loading.value = false;
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
    }
  };

  if (posts.value.length === 0 || storageData?.dataType !== "posts") {
    posts.value = [];

    fetchPosts();
  }

  const reFetchPosts = async () => {
    try {
      posts.value = [];
      setSessionItem("data", { dataType: "posts", data: posts.value });

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
      loading.value = false;
    } catch (apiError) {
      console.error("Failed to search posts:", apiError);
      showError("Failed to search posts. Please try again later.", apiError);
      loading.value = false;
      error.value =
        apiError instanceof Error ? apiError : new Error("An error occurred");
    }
  };

  const getPostById = async (
    id: string
  ): Promise<PostWithContent | undefined> => {
    try {
      const post = await apiPosts.getPost(id);
      return post;
    } catch (error) {
      console.error(`Failed to fetch post with id ${id}:`, error);
      showError(`Failed to fetch post. Please try again later.`, error);
    }
  };

  const onFetched = (callback: (data: PostWithContent[]) => void) => {
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
    getPostById,
  };
};
