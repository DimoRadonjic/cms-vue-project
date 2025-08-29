import { TableName } from ".";
import { supabase } from "..";

const table = TableName.gallery;

const uploadImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from("images")
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from("images")
    .createSignedUrl(file.name, 60 * 60 * 24 * 7); // 7 days

  if (urlError || !urlData) {
    throw new Error(urlError?.message || "Failed to create signed URL");
  }

  return { data: urlData, status: 201 };
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
  const { data, error } = await supabase.storage.from("images").remove([path]);

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
