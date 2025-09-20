import { useStorage } from "../storage";
import type { LoginProfileData, ProfileData } from "../../types/types";
import { useToastService } from "../toastService/AppToastService";
import { useAppRouter } from "../router/useAppRouter";
import { useAuthStore } from "../../store";
import { ref } from "vue";
import { auth } from "../../supabase/tables/tableProfiles";
import apiProfiles from "../../axios/api/profiles";

const { getLocalItem, clearStorage, setLocalItem, setSessionItem } =
  useStorage();

const isAuth = ref<boolean>(!!getLocalItem("token"));

export const useAuth = () => {
  const { showError, showSuccess } = useToastService();
  const { navigateTo } = useAppRouter();
  const { setUser, getUser, getUserPassword } = useAuthStore();

  const logout = () => {
    clearStorage();
    setUser(null);
    isAuth.value = false;
    showSuccess("Logged out successfully");
    navigateTo("login");
  };

  const login = async (newUser: LoginProfileData) => {
    try {
      const res = await apiProfiles.loginUser(newUser);

      if (res) {
        const { session, user } = res;
        setLocalItem("token", session.access_token);

        setUser(user);
        isAuth.value = true;
        showSuccess("Logged in successfully");

        navigateTo("posts");
        return;
      }
    } catch (error: any) {
      const detail = new Error(error.message);

      showError("Login failed", detail);
    }
  };

  const register = async (values: ProfileData) => {
    try {
      const res = await apiProfiles.registerUser(values);

      if (res?.session) {
        const { session } = res;
        setSessionItem("token", session?.access_token);
      }

      showSuccess("Registration successful.", 3000);
      navigateTo("posts");
    } catch (error: any) {
      const detail = new Error(error.message);
      showError("Registration failed.", detail, 3000);

      return;
    }
  };

  return {
    logout,
    login,
    getUser,
    setUser,
    isAuth,
    register,
    getUserPassword,
  };
};
