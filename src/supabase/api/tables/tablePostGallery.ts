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

export const removePostImage = async (image_id: string) => {
  const add = { image_id, post_id: null };
  const { data, status, error } = await supabase
    .from(table)
    .insert([add])
    .select();
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};
