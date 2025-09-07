import { TableName } from "..";
import { supabase } from "../..";
import type { PostData } from "../../../types/types";
import tableDocuments from "./tableDocuments";

const table = TableName.posts;

const getAllPosts = async () => {
  const { data, error } = await supabase.from(table).select(`
    id,
    title,
    authorUsername,
    description,
    mainImage:gallery!mainImageId (
      id,
      title,
      url,
      path,
      alt
    ),
    seo_slug,
    seo_metaTitle,
    seo_metaDescription,
    seo_keywords,
    seo_canonicalUrl,
    images:gallery!gallery_post_id_fkey (
      id,
      title,
      url,
      path,
      alt,
      post_id
    ),
    documents:documents!documents_post_id_fkey (
      id,
      title,
      url,
      path,
      post_id

  ),
  created_at,
  updated_at
  `);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const getPostById = async (id: string) => {
  const { data, error, status } = await supabase
    .from(table)
    .select(
      `
    id,
    title,
    authorUsername,
    description,
    mainImage:gallery!mainImageId (
      id,
      title,
      url,
      path,
      alt
    ),
    seo_slug,
    seo_metaTitle,
    seo_metaDescription,
    seo_keywords,
    seo_canonicalUrl,
    images:gallery!gallery_post_id_fkey (
      id,
      title,
      url,
      path,
      alt,
      post_id
    ),
    documents:documents!documents_post_id_fkey (
      id,
      title,
      url,
      path,
      post_id
    )
  `
    )
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const updatePostDocuments = async (
  postId: number,
  documentId: number,
  action: "add" | "remove" = "add"
) => {
  const { data: post } = await tableDocuments.getDocument(postId);

  const currentDocuments: number[] = post?.documents || [];
  let updatedDocuments: number[];

  if (action === "add") {
    updatedDocuments = currentDocuments.includes(documentId)
      ? currentDocuments
      : [...currentDocuments, documentId];
  } else {
    updatedDocuments = currentDocuments.filter((id) => id !== documentId);
  }

  const { data, error } = await supabase
    .from(table)
    .update({ documents: updatedDocuments })
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deletePostById = async (id: string) => {
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
  const { data, error, status } = await supabase
    .from(table)
    .insert(post)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return { data, status };
};

const updatePost = async (id: string, post: PostData) => {
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

const deletePosts = async (ids: string[]) => {
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
  updatePostDocuments,
};
