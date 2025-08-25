import { useSessionStorage } from "../localStorage/useSessionStorage";
import type { LoginProfileData } from "../../types/types";
import apiProfiles from "../../axios/api/profiles";
import { useToastService } from "../toastService/AppToastService";
import { useAppRouter } from "../router/useAppRouter";
import { useProfileStore } from "../../store";
import { ref } from "vue";

const { getItem, clearStorage, setItem } = useSessionStorage();

const isAuth = ref<boolean>(!!getItem("token"));

export const useAuth = () => {
  const { showError, showSuccess } = useToastService();
  const { navigateTo } = useAppRouter();
  const { setUser, getUser } = useProfileStore();

  const logout = () => {
    clearStorage();
    setUser(null);
    isAuth.value = false;
    showSuccess("Logged out successfully");
    navigateTo("login");
  };

  const login = async (newUser: LoginProfileData) => {
    try {
      const res = await apiProfiles.profileLogin(newUser);

      if (res) {
        setItem("token", res.token);

        showSuccess("Logged in successfully");
        setUser(res.profile);
        isAuth.value = true;

        navigateTo("dashboard");
      }
    } catch (error) {
      showError(
        "Login failed",
        error instanceof Error ? error : new Error("An error occurred")
      );
    }
  };

  const reRouteAuth = () => {
    if (!isAuth.value) {
      console.error("User is not authenticated");
      navigateTo("login");
    }
  };

  return {
    logout,
    login,
    getUser,
    reRouteAuth,
    isAuth,
  };
};
