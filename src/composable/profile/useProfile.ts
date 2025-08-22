import { ref } from "vue";
import api from "../../backend/api/axios";
import type { ProfileData } from "../../types/types";

export const useProfile = () => {
  const profile = ref<ProfileData>();

  const loadUserProfiles = async (username: string) => {
    const res = await api.get(`/profiles?username=${username}`);
    console.log("User profiles data:", res);
    if (res.data.length === 0) {
      throw new Error("ProfileData not found");
    }
    profile.value = res.data[0];
  };

  void loadUserProfiles("test");

  return {
    profile,
    loadUserProfiles,
  };
};
