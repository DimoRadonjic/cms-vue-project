import z from "zod";

export const BASE_URL = "https://www.example.com/";

export const canonicalUrlSchema = z
  .string()
  .min(1, { message: "Canonical URL cannot be empty." })
  .refine((val) => val.startsWith(BASE_URL), {
    message: `Canonical URL must start with ${BASE_URL}`,
  })
  .refine((val) => val !== BASE_URL, {
    message: "Canonical URL cannot be just the base URL, slug is required.",
  })
  .transform((val) => {
    // ukloni višestruke BASE_URL ako slučajno postoje
    const slug = val.replace(new RegExp(`^(${BASE_URL})+`), "");
    return `${BASE_URL}${slug}`;
  });

export const schemaPost = z.object({
  title: z.string().min(1, {
    message: "title is required.",
  }),

  description: z.string().min(1, {
    message: "description is required.",
  }),
  authorUsername: z.string().min(1, {
    message: "authorUsername is required.",
  }),

  seo_slug: z.string().min(1, {
    message: "seo_slug is required.",
  }),
  seo_metaTitle: z.string().min(1, {
    message: "seo_metaTitle is required.",
  }),
  seo_metaDescription: z.string().min(1, {
    message: "seo_metaDescription is required.",
  }),
  seo_keywords: z.string().min(1, {
    message: "seo_keywords is required.",
  }),
  seo_canonicalUrl: canonicalUrlSchema,
});
