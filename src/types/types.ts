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
  imageIds: string[];
  description: string;
  documentIds: string[];
  authorUsername: string;
  seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: Array<string>;
    canonicalUrl: string;
  };
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
};
