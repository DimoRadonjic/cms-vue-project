import { TableName } from ".";
import { supabase } from "..";
import type { PostData } from "../../types/types";

const table = TableName.posts;

const getAllPosts = async () => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const getPostById = async (id: number) => {
  const { data, error, status } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }

  console.log("supabase data", data);

  return { data, status };
};

const deletePostById = async (id: number) => {
  const { data, error, status } = await supabase
    .from(table)
    .delete()
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  return { data, status };
};

const createPost = async (post: PostData) => {
  const { data, error } = await supabase
    .from(table)
    .insert(post)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const updatePost = async (id: number, post: PostData) => {
  const { data, error } = await supabase
    .from(table)
    .update(post)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const deletePosts = async (ids: number[]) => {
  if (typeof ids[0] !== "number") {
    ids.map(Number);
  }
  const { data, error, status } = await supabase
    .from(table)
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
  return { data, status };
};

const searchPosts = async (query: string) => {
  try {
    const { data, status } = await supabase
      .from(table)
      .select()
      .ilike("title", `%${query}%`);

    return { data, status };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const tablePosts = {
  getAllPosts,
  getPostById,
  deletePostById,
  createPost,
  updatePost,
  deletePosts,
  searchPosts,
};
