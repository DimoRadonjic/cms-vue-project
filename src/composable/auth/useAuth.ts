import { useSessionStorage } from "../sessionStorage/useSessionStorage";
import type { LoginProfileData } from "../../types/types";
import { useToastService } from "../toastService/AppToastService";
import { useAppRouter } from "../router/useAppRouter";
import { useAuthStore } from "../../store";
import { ref } from "vue";
import { auth } from "../../supabase/api/tableProfiles";

const { getItem, clearStorage, setItem } = useSessionStorage();

const isAuth = ref<boolean>(!!getItem("token"));

export const useAuth = () => {
  const { showError, showSuccess } = useToastService();
  const { navigateTo } = useAppRouter();
  const { setUser, getUser } = useAuthStore();

  const logout = () => {
    clearStorage();
    setUser(null);
    isAuth.value = false;
    showSuccess("Logged out successfully");
    navigateTo("login");
  };

  const login = async (newUser: LoginProfileData) => {
    try {
      const res = await auth.loginUser(newUser);

      if (res) {
        const { session, user } = res;
        setItem("token", session.access_token);

        showSuccess("Logged in successfully");
        setUser(user);
        isAuth.value = true;

        navigateTo("dashboard");
        return;
      }
    } catch (error: any) {
      const detail = new Error(error.message);

      showError("Login failed", detail);
    }
  };

  return {
    logout,
    login,
    getUser,
    isAuth,
  };
};
