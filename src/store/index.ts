import { createPinia, defineStore } from "pinia";
import { ref } from "vue";
import type { ProfileData } from "../types/types";
import { useStorage } from "../composable";
import { auth } from "../supabase/tables/tableProfiles";

const pinia = createPinia();

export const useAuthStore = defineStore("profile", () => {
  const user = ref<ProfileData>({ password: "", username: "", email: "" });
  const { setSessionItem, getSessionItem, removeSessionItem } = useStorage();
  const fetchPassword = async (username: string) => {
    try {
      const password = await auth.getPasswordByUsername(username);
      return password;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  function setUser(newUser: ProfileData | null): void {
    if (newUser) {
      user.value = { ...newUser };
      setSessionItem("profile", user.value);
    } else {
      removeSessionItem("profile");
    }
  }

  function getUser(): ProfileData | null {
    const user = getSessionItem<ProfileData>("profile");

    return user ?? null;
  }

  async function getUserPassword(): Promise<string> {
    const user = getSessionItem<ProfileData>("profile");

    if (user) {
      try {
        const password = await fetchPassword(user.username);
        return password;
      } catch (error: any) {
        console.error(error.message);
        return "";
      }
    }
    return "";
  }
  return { getUser, setUser, getUserPassword };
});

export default pinia;
