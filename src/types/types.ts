import type { FormSubmitEvent } from "@primevue/forms";

type ProfileData = {
  username: string;
  password: string;
  email: string;
};

type LoginProfileData = Omit<ProfileData, "email">;

type PostData = {
  id: string;
  title: string;
  mainImageId: string;
  description: string;
  authorUsername: string;
  seo_slug: string;
  seo_metaTitle: string;
  seo_metaDescription: string;
  seo_keywords: Array<string>;
  seo_canonicalUrl: string;
};

type PostWithContent = Omit<PostData, "mainImageId"> & {
  documents: DocumentItem[];
  mainImage: ImageItem;
  images: ImageItem[];
};

type ImageItem = {
  id: string;
  title: string;
  url: string;
  path: string;
  alt: string;
  post_id: string | null;
};

type DocumentItem = {
  id: string;
  title: string;
  url: string;
  path: string;
  post_id: string | null;
};

type NewPost = {
  title: string;
  mainImageId: string;
  imageIds: string[];
  description: string;
  documentIds: string[];
  authorUsername: string;

  seo_slug: string;
  seo_metaTitle: string;
  seo_metaDescription: string;
  seo_keywords: Array<string>;
  seo_canonicalUrl: string;
};

type Gallery = {
  id: string;
};

type GStoreData = {
  profile: ProfileData | null;
  posts: PostData[];
  gallery: Gallery[];
};

type FilterType = {
  value: string;
  matchMode: string;
};

type StorageData = {
  dataType: "posts" | "gallery" | "documents";
  data: any;
};

export type {
  FormSubmitEvent,
  ProfileData,
  PostData,
  GStoreData,
  FilterType,
  StorageData,
  LoginProfileData,
  DocumentItem,
  Gallery,
  ImageItem,
  NewPost,
  PostWithContent,
};
