import type { PostData } from "../types/types";
import api from "./axios";

import { errorMessage } from "./utils";

const getPosts = async () => {
  try {
    const data = await api.get("/posts");

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch posts", error);
  }
};

const getPost = async (id: string) => {
  try {
    const data = await api.get(`/post/${id}`);

    return data;
  } catch (error: any) {
    errorMessage(`Failed to get post with id: ${id}`, error);
  }
};

const createPost = async (data: PostData) => {
  try {
    const status = await api.post("/posts", data);

    return status;
  } catch (error: any) {
    errorMessage("Failed to create posts", error);
  }
};

const deletePost = async (id: string) => {
  try {
    const status = await api.delete("/post");

    return status;
  } catch (error: any) {
    errorMessage(`Failed to delete post with id: ${id}`, error);
  }
};

const updatePost = async (data: PostData) => {
  const { id } = data;
  try {
    const status = await api.put("/post", data);

    return status;
  } catch (error: any) {
    errorMessage(`Failed to update post with id: ${id}`, error);
  }
};

const searchPosts = async (query: string) => {
  try {
    const data = await api.get(`/posts?search=${query}`);
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
};

export default apiPosts;
