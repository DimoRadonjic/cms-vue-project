import tableGallery from "../../supabase/api/tableGallery";
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
    const res = await tableGallery.uploadImage(image[0]);

    console.log("link", res);

    return res;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const apiImages = { getImagesAPI, uploadMainImageAPI };

export default apiImages;
