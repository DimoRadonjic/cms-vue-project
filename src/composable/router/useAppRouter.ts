import { useRouter } from "vue-router";

const protectedRoutes = {
  home: "home",
  dashboard: "dashboard",
  posts: "posts",
  newPost: "new-post",
  postView: "post-view",
  gallery: "gallery",
  imageView: "image-view",
  newImage: "new-image",
  documents: "documents",
  documentView: "document-view",
  profileDetail: "profile",
};

const routes = {
  register: "register",
  login: "login",
  notFound: "not-found",
  resource404: "404Resource",
  networkError: "NetworkError",
  protected: protectedRoutes,
};

export const useAppRouter = () => {
  const router = useRouter();

  const navigateTo = (name: string, params?: Record<string, any>) => {
    router.push({ name, params });
  };

  const goBack = () => {
    router.back();
  };

  const getRouteID = (): string => {
    return router.currentRoute.value.params.id as string;
  };

  return {
    navigateTo,
    goBack,
    router,
    getRouteID,
    routes,
  };
};
