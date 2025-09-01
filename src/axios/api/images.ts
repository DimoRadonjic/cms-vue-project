import tableGallery from "../../supabase/api/tableGallery";
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

const uploadMainImageAPI = async (image: File[]) => {
  try {
    const { data, status } = await tableGallery.uploadImage(image[0]);

    return { data, status, error: null };
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
    return { data: null, status: null, error };
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

const apiImages = { getImagesAPI, uploadMainImageAPI, removeMainImageAPI };

export default apiImages;
