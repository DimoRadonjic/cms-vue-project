import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from "axios";
import { supabase } from "../supabase";

// Mapa za pamćenje kontrolera po Key (method + ':' + url)
const controllers = new Map<
  string,
  {
    controller: AbortController;
    status: "SUCCESS" | "FAILED" | "ABORTED" | "PENDING";
  }
>();

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper za kreiranje jedinstvenog ključa za svaki request
const getKey = (method: Method, url: string) =>
  `${method.toUpperCase()}:${url}`;

// Wrapper za sve metode sa otkazivanjem prethodnog requesta
const requestWithAbort = async <T = any>(
  method: Method,
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const key = getKey(method, url);

  if (controllers.has(key)) {
    controllers.get(key)?.controller!.abort();
  }

  const controller = new AbortController();
  controllers.set(key, { controller, status: "PENDING" });

  const mergedConfig: AxiosRequestConfig = {
    ...config,
    method,
    url,
    signal: controller.signal,
  };

  controllers.delete(key);

  try {
    const response = await apiClient.request<T>(mergedConfig);

    controllers.delete(key);
    return response.data;
  } catch (err: any) {
    if (err.name === "CanceledError" || err.name === "AbortError") {
      console.log(`[ABORTED] ${key}`);
    } else {
      console.error(`[ERROR] ${key}`, err);
    }

    throw err;
  }
};

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

const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    requestWithAbort<T>("GET", url, config),
  delete: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithAbort<T>("DELETE", url, { ...config, data }),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithAbort<T>("POST", url, { ...config, data }),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithAbort<T>("PUT", url, { ...config, data }),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithAbort<T>("PATCH", url, { ...config, data }),
};

export default api;
