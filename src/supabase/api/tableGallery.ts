import { BucketsName, TableName } from ".";
import { supabase } from "..";

const table = TableName.gallery;
const bucket = BucketsName.gallery;

const uploadImage = async (file: File) => {
  const path = `gallery/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (urlError || !urlData) {
    throw new Error(urlError?.message || "Failed to create signed URL");
  }

  return { link: urlData.signedUrl, status: 201 };
};

const getGallery = async () => {
  const { data, status, error } = await supabase.from(table).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const addImageToGallery = async (image: any) => {
  const { data, status, error } = await supabase.from(table).insert([image]);
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const deleteImageFromGallery = async (id: number) => {
  const { data, status, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const deleteImageFromStorage = async (path: string) => {
  const { data, error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  return { data, status: 200 };
};

const tableGallery = {
  getGallery,
  addImageToGallery,
  deleteImageFromGallery,
  uploadImage,
  deleteImageFromStorage,
};

export default tableGallery;
