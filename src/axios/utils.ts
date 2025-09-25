export const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function errorMessage(message: string, error?: any) {
  console.error(message, error);

  if (error && typeof error === "object") {
    if (Array.isArray(error)) {
      console.error("Error array:", error);
    } else {
      console.error("Error object:", JSON.stringify(error, null, 2));
    }
  } else {
    console.error("Error string:", String(error));
  }
}
