import type {
  DocumentItem,
  ImageItem,
  PostData,
  PostWithContent,
} from "../../types/types";
import { errorMessage } from "../utils";
import { tablePosts } from "../../supabase/api/tables/tablePosts";

const getPosts = async () => {
  try {
    const data = await tablePosts.getAllPosts();

    console.log("all posts", data);

    return data ?? (data as PostWithContent[]);
  } catch (error: any) {
    errorMessage("Failed to fetch posts", error);
  }
};

const getPost = async (id: string): Promise<PostWithContent | undefined> => {
  try {
    const { data } = await tablePosts.getPostById(id);

    const allImages = data.images.map((i: any) => ({
      id: i.id,
      title: i.title,
      url: i.url,
      path: i.path,
      alt: i.alt_text,
    })) as ImageItem[];

    const dataMainImage = data.mainImage as unknown as ImageItem;

    const dataImages = allImages.filter(({ id }) => id !== dataMainImage.id);

    const postData: PostWithContent = {
      id: data.id,
      title: data.title,
      description: data.description,
      authorUsername: data.authorUsername,
      seo_slug: data.seo_slug,
      seo_metaTitle: data.seo_metaTitle,
      seo_metaDescription: data.seo_metaDescription,
      seo_keywords: data.seo_keywords || [],
      seo_canonicalUrl: data.seo_canonicalUrl,
      mainImage: dataMainImage,
      images: dataImages,
      documents: data.documents.map((d: any) => ({
        id: d.id,
        title: d.title,
        url: d.url,
        path: d.path,
      })) as DocumentItem[],
    };

    return postData;
  } catch (error: any) {
    errorMessage(`Failed to get post with id: ${id}`, error);
  }
};

const createPost = async (postData: PostData) => {
  try {
    const { status, data } = await tablePosts.createPost(postData);

    return { status, data };
  } catch (error: any) {
    errorMessage("Failed to create posts", error);
  }
};

const deletePost = async (id: string) => {
  try {
    const { status, data } = await tablePosts.deletePostById(id);

    return { status, data };
  } catch (error: any) {
    errorMessage(`Failed to delete post with id: ${id}`, error);
  }
};

const deletePosts = async (ids: string[]) => {
  try {
    const { status, data } = await tablePosts.deletePosts(ids);

    return { status, data };
  } catch (error: any) {
    errorMessage(`Failed to delete post with id: ${ids}`, error);
  }
};

const updatePost = async (data: PostData) => {
  const { id } = data;
  try {
    const { status } = await tablePosts.updatePost(id, data);

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
