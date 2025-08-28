import { ref } from "vue";
import type { ProfileData } from "../../types/types";
import { supabase } from "../../supabase";

export const useProfile = () => {
  const profile = ref<ProfileData>();

  // const loadUserProfiles = async (username: string) => {
  //   const res = await api.get(`/profiles?username=${username}`);
  //   console.log("User profiles data:", res);
  //   if (res.data.length === 0) {
  //     throw new Error("ProfileData not found");
  //   }
  //   profile.value = res.data[0];
  // };

  const loadUserProfiles = async (username: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username);

    if (error) {
      console.error("Error fetching profile:", error.message);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("ProfileData not found");
    }

    profile.value = data[0];
  };

  void loadUserProfiles("test");

  return {
    profile,
    loadUserProfiles,
  };
};
