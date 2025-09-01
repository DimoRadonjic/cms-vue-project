import { BucketsName, TableName } from ".";
import { supabase } from "..";
import type { ImageItem } from "../../types/types";

const table = TableName.gallery;
const bucket = BucketsName.gallery;

const uploadImage = async (file: File) => {
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

  const { id, path: dataPath } = data;
  const image: ImageItem = {
    id,
    title: fileTitle,
    alt: fileTitle,
    path: dataPath,
    url: urlData.signedUrl,
  };

  try {
    const { data, status } = await addImageToGallery(image);
    return { data, status };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getGallery = async () => {
  const { data, status, error } = await supabase.from(table).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const addImageToGallery = async (image: ImageItem) => {
  const { data, status, error } = await supabase
    .from(table)
    .insert([image])
    .select();

  console.log("data added", data);
  if (error) {
    throw new Error(error.message);
  }

  return { data: data[0], status };
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

const tableGallery = {
  getGallery,
  addImageToGallery,
  deleteImageFromGallery,
  uploadImage,
  deleteImageFromStorage,
};

export default tableGallery;
