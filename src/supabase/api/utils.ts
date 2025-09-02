export const errorMessageSupabase = (error: any) => {
  if (error) {
    throw new Error(error.message);
  }
};

export const sanitizeFileName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
};
