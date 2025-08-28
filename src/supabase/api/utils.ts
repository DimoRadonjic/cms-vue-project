export const errorMessageSupabase = (error: any) => {
  if (error) {
    throw new Error(error.message);
  }
};
