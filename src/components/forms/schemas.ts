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
    const slug = val.replace(new RegExp(`^(${BASE_URL})+`), "");
    return `${BASE_URL}${slug}`;
  });

export const schemaPost = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),

  description: z.string().min(1, {
    message: "Description is required.",
  }),
  authorUsername: z.string().min(1, {
    message: "Author is required.",
  }),

  seo_slug: z.string().min(1, {
    message: "Slug is required.",
  }),
  seo_metaTitle: z.string().min(1, {
    message: "Meta title is required.",
  }),
  seo_metaDescription: z.string().min(1, {
    message: "Meta description is required.",
  }),
  seo_keywords: z.string().min(1, {
    message: "Keywords are required.",
  }),
  seo_canonicalUrl: canonicalUrlSchema,
});

export const schemaRegister = z
  .object({
    username: z.string().min(1, {
      message: "Username is required.",
    }),
    email: z
      .string()
      .min(1, {
        message: "Email is required.",
      })
      .email("Invalid email address."),
    password: z
      .string()
      .min(1, {
        message: "Password is required.",
      })
      .min(8, {
        message: "Minimum password length is 8 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    retypepassword: z
      .string()
      .min(1, { message: "Please retype your password." }),
  })
  .refine((data) => data.password === data.retypepassword, {
    path: ["retypepassword"],
    message: "Passwords do not match.",
  });

export const schemaLogin = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});
