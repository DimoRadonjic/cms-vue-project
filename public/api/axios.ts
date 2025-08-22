import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from "axios";

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
