import axios, { type AxiosInstance } from "axios";
import { supabase } from "../supabase";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dodaj token
apiClient.interceptors.request.use(async (config) => {
  const { data, error } = await supabase.auth.getSession();

  if (!error && data?.session) {
    const token = data.session.access_token;
    if (config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    }
  }

  return config;
});

export const getValidAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) return null;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = data.session.expires_at || 0;

  if (expiresAt - now < 300) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (error || !refreshed?.session) return null;
    return refreshed.session.access_token;
  }

  return data.session.access_token;
};

apiClient.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  if (token) {
    if (config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    }
  }

  return config;
});
