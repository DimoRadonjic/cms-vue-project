import { TableName } from "..";
import { supabase } from "../..";
import type { PostData } from "../../../types/types";

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
     images:posts_gallery (
      gallery (
        id,
        title,
        url,
        path,
        alt
      )
    ),
    documents:posts_documents (
      documents (
        id,
        title,
        url,
        path
      )
    ),
  created_at,
  updated_at
  `);
  if (error) {
    throw new Error(error.message);
  }

  const newData = data.map((d) => ({
    ...d,
    documents: d.documents.flatMap((post) => post.documents),
    images: d.images.flatMap((post) => post.gallery),
  }));

  console.log("newData", newData);

  return newData;
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
     images:posts_gallery (
      gallery (
        id,
        title,
        url,
        path,
        alt
      )
    ),
    documents:posts_documents (
      documents (
        id,
        title,
        url,
        path
      )
    ),
  created_at,
  updated_at
  `
    )
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }

  const flatDocs = data.documents.flatMap((post) => post.documents);
  const flatImages = data.images.flatMap((post) => post.gallery);

  console.log("flat images", flatImages);

  return { data: { ...data, documents: flatDocs, images: flatImages }, status };
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
};
