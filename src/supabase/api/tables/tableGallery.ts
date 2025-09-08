import { BucketsName, TableName } from "..";
import { supabase } from "../..";
import type { ImageItem } from "../../../types/types";
import { addPostImage } from "./tablePostGallery";

const table = TableName.gallery;
const bucket = BucketsName.gallery;

type Image = Omit<ImageItem, "id" | "post_ids">;

type APIGalleryResponse = Promise<{ data: ImageItem[]; status: number }>;

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
  };

  try {
    const { data, status } = await addImageToGallery(image);
    await addPostImage(data.id, post_id);

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

const getGallery = async (): APIGalleryResponse => {
  const { data, status, error } = await supabase.from(table).select(`
    id,
    title,
    alt,
    url,
    path,
    post_ids:posts_gallery (
      post_id
    )
  `);

  if (error) {
    throw new Error(error.message);
  }

  const imgs =
    data?.map((doc) => ({
      ...doc,
      post_ids: doc.post_ids.map((pd: { post_id: string }) => pd.post_id),
    })) ?? [];

  return { data: imgs, status };
};

const availableImages = async (postID: string) => {
  const { data } = await getGallery();

  const available = data?.filter(
    (img) => !img.post_ids.some((p) => p === postID)
  );

  return available as unknown as ImageItem[];
};

const addImageToGallery = async (
  image: Image
): Promise<{ data: ImageItem; status: number }> => {
  const { data, status, error } = await supabase
    .from(table)
    .insert([image])
    .select();

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
  availableImages,
};

export default tableGallery;
