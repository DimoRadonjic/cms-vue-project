import tableGallery from "../../supabase/api/tables/tableGallery";
import type { ImageItem } from "../../types/types";
import { errorMessage } from "../utils";

const getImagesAPI = async () => {
  try {
    const { data } = await tableGallery.getGallery();

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const uploadMainImageAPI = async (image: File, post_id: string) => {
  try {
    const { data, status } = await tableGallery.uploadImage(image, post_id);

    return { data, status, error: null };
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
    return { data: null, status: 500 };
  }
};

const uploadImagesAPI = async (images: File[], post_id: string) => {
  try {
    const response = await tableGallery.uploadImages(images, post_id);
    console.log("response", response);

    return { data: response, status: 200 };
  } catch (error: any) {
    errorMessage("Failed to upload document", error);
    return { data: null, status: 500 };
  }
};

const removeMainImageAPI = async (image: ImageItem) => {
  try {
    const res = await tableGallery.deleteImageFromStorage(image);

    return res;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const removeImagesAPI = async (images: ImageItem[]) => {
  try {
    const res = await tableGallery.deleteImagesFromStorage(images);
    console.log("deletion", res);

    return res;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const apiImages = {
  getImagesAPI,
  uploadMainImageAPI,
  removeMainImageAPI,
  uploadImagesAPI,
  removeImagesAPI,
};

export default apiImages;
