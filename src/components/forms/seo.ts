import { BASE_URL } from "./schemas";

export const generateSeoSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const generateKeywords = (value: string) => {
  return value
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2)
    .join(", ");
};

export const generateCanonicalUrl = (value: string) => {
  const cleanSlug = value.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

  return `${BASE_URL}${cleanSlug}`;
};

export const generateMetaDescription = (title: string) => {
  return title ? `Read more about ${title}` : "";
};
