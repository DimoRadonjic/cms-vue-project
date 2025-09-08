import { JunctionTableName } from "..";
import { supabase } from "../..";

const table = JunctionTableName.posts_gallery;

export const addPostImage = async (image_id: string, post_id: string) => {
  const add = { image_id, post_id };
  const { data, status, error } = await supabase
    .from(table)
    .insert([add])
    .select();
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

export const removePostImage = async (image_id: string, post_id: string) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("image_id", image_id)
    .eq("post_id", post_id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
export const addPostImages = async (image_ids: string[], post_id: string) => {
  const updatePromises = image_ids.map(async (id) => {
    await addPostImage(id, post_id);
  });

  return Promise.all(updatePromises);
};

export const removePostImages = async (
  image_ids: string[],
  post_id: string
) => {
  const updatePromises = image_ids.map(async (id) => {
    await removePostImage(id, post_id);
  });

  return Promise.all(updatePromises);
};
