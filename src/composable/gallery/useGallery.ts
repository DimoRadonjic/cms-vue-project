import { ref, watch } from "vue";
import { useStorage } from "../storage";
import { useToastService } from "../toastService/AppToastService";
import type { ImageItem, StorageData } from "../../types/types";
import apiImages from "../../axios/api/images";

export const useGallery = () => {
  const { showError, showSuccess } = useToastService();
  const { getSessionItem, setSessionItem } = useStorage();
  const storageData = getSessionItem<StorageData>("data");

  const data = ref<ImageItem[]>(storageData?.data || []);
  const loading = ref<boolean>(false);
  const error = ref<Error>();

  const fetch = async () => {
    loading.value = true;
    try {
      const res = await apiImages.getImagesAPI();

      if (res) {
        data.value = res;
        setSessionItem("data", { dataType: "gallery", data: data.value });
      }

      loading.value = false;
    } catch (apiError) {
      console.error("Failed to fetch gallery:", apiError);
      showError("Failed to fetch images. Please try again later.", apiError);
      loading.value = false;
      error.value =
        error instanceof Error ? error : new Error("An error occurred");
    }
  };

  if (!data.value.length || storageData?.dataType !== "gallery") {
    data.value = [];
    fetch();
  }

  const reFetch = async () => {
    try {
      data.value = [];

      await fetch();

      showSuccess("Images refreshed successfully");
    } catch (apiError) {
      console.error("Failed to re-fetch images:", apiError);
      showError("Failed to refresh images. Please try again later.", apiError);
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

  const uploadImages = async (files: File[], post_id: string) => {
    loading.value = true;

    try {
      const res = await apiImages.uploadImagesAPI(files, post_id);
      loading.value = false;

      return res;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Failed to upload images. Please try again later.", detail);
    }
  };

  const uploadImage = async (files: File, post_id: string) => {
    loading.value = true;

    try {
      const res = await apiImages.uploadMainImageAPI(files, post_id);
      loading.value = false;

      return res;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Failed to upload images. Please try again later.", detail);
    }
  };
  const deleteImages = async (images: ImageItem[]) => {
    loading.value = true;

    try {
      await apiImages.removeImagesAPI(images);
      loading.value = false;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Failed to delete images. Please try again later.", detail);
    }
  };

  const getAvailableImages = async (postID: string) => {
    loading.value = true;

    try {
      const res = await apiImages.getAvailableImagesByPostID(postID);
      loading.value = false;

      return res;
    } catch (error: any) {
      const detail = new Error(error.message);
      showError(
        "Failed to get available images. Please try again later.",
        detail
      );
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
    uploadImages,
    uploadImage,
    deleteImages,
    getAvailableImages,
  };
};
