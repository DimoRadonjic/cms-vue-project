import { createPinia, defineStore } from "pinia";
import { ref } from "vue";
import type { ProfileData } from "../types/types";
import { useSessionStorage } from "../composable";

const pinia = createPinia();

export const useAuthStore = defineStore("profile", () => {
  const user = ref<ProfileData>({ password: "", username: "", email: "" });
  const { setItem, getItem, removeItem } = useSessionStorage();

  function setUser(newUser: ProfileData | null): void {
    if (newUser) {
      user.value = { ...newUser };
      setItem("profile", user.value);
    } else {
      removeItem("profile");
    }
  }

  function getUser(): ProfileData | null {
    return getItem<ProfileData>("profile") ?? null;
  }
  return { getUser, setUser };
});

export default pinia;
