import { useRouter } from "vue-router";

export const useAppRouter = () => {
  const router = useRouter();

  const navigateTo = (name: string, params?: Record<string, any>) => {
    router.push({ name, params });
  };

  const goBack = () => {
    router.back();
  };

  return {
    navigateTo,
    goBack,
    router,
  };
};
