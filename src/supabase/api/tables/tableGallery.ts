import { BucketsName, TableName } from "..";
import { supabase } from "../..";
import type { ImageItem } from "../../../types/types";

const table = TableName.gallery;
const bucket = BucketsName.gallery;

type Image = Omit<ImageItem, "id">;

const uploadImage = async (
  file: File,
  post_id: string
): Promise<{ data: ImageItem; status: number }> => {
  const path = `${Date.now()}-${file.name}`;
  const { error, data } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  console.log("data after upload", data);

  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (urlError || !urlData) {
    throw new Error(urlError?.message || "Failed to create signed URL");
  }

  const fileTitle = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");

  const { path: dataPath } = data;

  const image: Image = {
    title: fileTitle,
    alt: fileTitle,
    path: dataPath,
    url: urlData.signedUrl,
    post_id,
  };

  try {
    const { data, status } = await addImageToGallery(image);
    return { data, status };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const uploadImages = async (files: File[], post_id: string) => {
  const uploadPromises = files.map(async (file): Promise<ImageItem> => {
    const { data } = await uploadImage(file, post_id);

    return data;
  });

  return Promise.all(uploadPromises);
};

const getGallery = async () => {
  const { data, status, error } = await supabase.from(table).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const addImageToGallery = async (
  image: Image
): Promise<{ data: ImageItem; status: number }> => {
  const { data, status, error } = await supabase
    .from(table)
    .insert([image])
    .select();

  console.log("data added", data);
  if (error) {
    throw new Error(error.message);
  }

  return { data: data[0] as ImageItem, status };
};

const deleteImageFromGallery = async (id: string) => {
  const { data, status, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const deleteImageFromStorage = async (image: ImageItem) => {
  const { id, path } = image;
  const { error: errorFromStorage } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (errorFromStorage) {
    throw new Error(errorFromStorage.message);
  }
  await deleteImageFromGallery(id);

  return { status: 204 };
};

const deleteImagesFromStorage = async (
  images: ImageItem[]
): Promise<void[]> => {
  const deletionPromises = images.map(async (file) => {
    await deleteImageFromStorage(file);
  });

  return Promise.all(deletionPromises);
};

const updateImage = async (image: ImageItem) => {
  try {
    const { error } = await supabase
      .from(table)
      .update(image)
      .eq("id", image.id);

    if (error) {
      throw error;
    }
  } catch (err: any) {
    console.error("Failed to update document:", err);
    throw new Error(err.message);
  }
};

const updateImages = async (images: ImageItem[]) => {
  const updatePromises = images.map(async (image) => {
    await updateImage(image);
  });

  return Promise.all(updatePromises);
};

const tableGallery = {
  getGallery,
  addImageToGallery,
  deleteImageFromGallery,
  uploadImage,
  deleteImageFromStorage,
  uploadImages,
  deleteImagesFromStorage,
  updateImage,
  updateImages,
};

export default tableGallery;
