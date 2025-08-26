import { supabase } from "../../supabase";
import { errorMessage } from "../utils";

const getImages = async () => {
  try {
    const { data } = await supabase.from("Images").select("*");

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch images", error);
  }
};

const apiImages = { getImages };

export default apiImages;
