import api from "./axios";
import { errorMessage } from "./utils";

const getImages = async () => {
  try {
    const data = await api.get("/images");

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const apiImages = { getImages };

export default apiImages;
