import { createPinia, defineStore } from "pinia";
import { ref } from "vue";
import type { ProfileData } from "../types/types";
import { useStorage } from "../composable";

const pinia = createPinia();

export const useAuthStore = defineStore("profile", () => {
  const user = ref<ProfileData>({ password: "", username: "", email: "" });
  const { setSessionItem, getSessionItem, removeSessionItem } = useStorage();

  function setUser(newUser: ProfileData | null): void {
    if (newUser) {
      user.value = { ...newUser };
      setSessionItem("profile", user.value);
    } else {
      removeSessionItem("profile");
    }
  }

  function getUser(): ProfileData | null {
    return getSessionItem<ProfileData>("profile") ?? null;
  }
  return { getUser, setUser };
});

export default pinia;
