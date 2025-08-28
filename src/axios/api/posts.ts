import type { PostData } from "../../types/types";
import { errorMessage } from "../utils";
import { supabase } from "../../supabase";
import { tablePosts } from "../../supabase/api/tablePosts";

const getPosts = async () => {
  try {
    const { data } = await supabase.from("Posts").select();

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch posts", error);
  }
};

const getPost = async (id: string): Promise<PostData | undefined> => {
  try {
    const { data } = await tablePosts.getPostById(Number(id));

    return data;
  } catch (error: any) {
    errorMessage(`Failed to get post with id: ${id}`, error);
  }
};

const createPost = async (data: PostData) => {
  try {
    const { status } = await tablePosts.createPost(data);

    return status;
  } catch (error: any) {
    errorMessage("Failed to create posts", error);
  }
};

const deletePost = async (id: string) => {
  try {
    const { status, data } = await tablePosts.deletePostById(Number(id));

    return { status, data };
  } catch (error: any) {
    errorMessage(`Failed to delete post with id: ${id}`, error);
  }
};

const deletePosts = async (id: string[]) => {
  try {
    const { status, data } = await tablePosts.deletePosts(id.map(Number));

    return { status, data };
  } catch (error: any) {
    errorMessage(`Failed to delete post with id: ${id}`, error);
  }
};

const updatePost = async (data: PostData) => {
  const { id } = data;
  try {
    const { status } = await tablePosts.updatePost(Number(id), data);

    return status;
  } catch (error: any) {
    errorMessage(`Failed to update post with id: ${id}`, error);
  }
};

const searchPosts = async (query: string) => {
  try {
    const { data } = await tablePosts.searchPosts(query);
    return data;
  } catch (error: any) {
    errorMessage("Failed to search posts", error);
  }
};

const apiPosts = {
  getPosts,
  createPost,
  deletePost,
  updatePost,
  getPost,
  searchPosts,
  deletePosts,
};

export default apiPosts;
