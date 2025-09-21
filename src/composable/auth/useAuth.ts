import { useStorage } from "../storage";
import type { LoginProfileData, ProfileData } from "../../types/types";
import { useToastService } from "../toastService/AppToastService";
import { useAppRouter } from "../router/useAppRouter";
import { useAuthStore } from "../../store";
import { ref } from "vue";
import apiProfiles from "../../axios/api/profiles";

const {
  getLocalItem,
  clearStorage,
  setLocalItem,
  setSessionItem,
  getSessionItem,
} = useStorage();

const isAuth = ref<boolean>(!!getLocalItem("token"));
const verfiyEmail = ref<boolean>(!!getSessionItem("verify"));

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

  const deletion = () => {
    clearStorage();
    setUser(null);
    isAuth.value = false;
    showSuccess("Account deleted successfully");
    navigateTo("login");
  };

  const deleteAccount = async (email: string) => {
    try {
      await apiProfiles.deleteUserByEmail(email);
      deletion();
    } catch (error: any) {
      showError("Failed to deleting user", error.message);
      throw new Error(error.message);
    }
  };

  const login = async (newUser: LoginProfileData) => {
    try {
      const res = await apiProfiles.loginUser(newUser);

      console.log("res", res);

      const { session, user } = res;

      setLocalItem("token", session?.access_token);
      setUser(user);
      isAuth.value = true;
      showSuccess("Logged in successfully");
      navigateTo("posts");
    } catch (error: any) {
      showError("Login failed", error);
      throw new Error(error.message);
    }
  };

  const register = async (values: ProfileData) => {
    try {
      const res = await apiProfiles.registerUser(values);
      console.log("res register", res);

      if (res && res.session) {
        const { session } = res;
        setSessionItem("token", session?.access_token);
      }

      setSessionItem("verify", true);

      return res;
    } catch (error: any) {
      showError("Registration failed.", error);
      throw new Error(error.message);
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
    deleteAccount,
    verfiyEmail,
  };
};
