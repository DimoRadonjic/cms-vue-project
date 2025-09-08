import tableGallery from "../../supabase/api/tables/tableGallery";
import {
  addPostImages,
  removePostImages,
} from "../../supabase/api/tables/tablePostGallery";
import type { ImageItem } from "../../types/types";
import { errorMessage } from "../utils";

const getImagesAPI = async (): Promise<ImageItem[] | undefined> => {
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

    return res;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const updateImageAPI = async (image: ImageItem) => {
  try {
    await tableGallery.updateImage(image);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const updateImagesAPI = async (images: ImageItem[]) => {
  try {
    await tableGallery.updateImages(images);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const addPostImagesAPI = async (image_ids: string[], post_id: string) => {
  try {
    await addPostImages(image_ids, post_id);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to add image link", error);
    return { status: 500 };
  }
};

const removePostImagesAPI = async (image_ids: string[], post_id: string) => {
  try {
    await removePostImages(image_ids, post_id);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to remove image link", error);
    return { status: 500 };
  }
};

const getAvailableImagesByPostID = async (postID: string) => {
  try {
    const res = await tableGallery.availableImages(postID);
    return { data: res, status: 200 };
  } catch (error: any) {
    errorMessage("Failed to get available images", error);
    return { status: 500 };
  }
};

const apiImages = {
  getImagesAPI,
  uploadMainImageAPI,
  removeMainImageAPI,
  uploadImagesAPI,
  removeImagesAPI,
  updateImageAPI,
  updateImagesAPI,
  addPostImagesAPI,
  removePostImagesAPI,
  getAvailableImagesByPostID,
};

export default apiImages;
