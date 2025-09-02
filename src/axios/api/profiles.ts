import bcrypt from "bcryptjs";
import type { LoginProfileData, ProfileData } from "../../types/types";
import api from "..";
import { hashString, createDummyJWT, errorMessage } from "../utils";
import { supabase } from "../../supabase";

const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};

const getProfile = async (username: string) => {
  try {
    const data = await api.get(`/profiles?username=${username}`);

    if (data[0] === 0) {
      throw new Error("Profile not found");
    }

    return data[0];
  } catch (error: any) {
    errorMessage("Failed to get profile", error);
  }
};

const updateProfile = async (username: string, profileData: any) => {
  try {
    const data = await api.put(`/profiles/${username}`, profileData);
    return data;
  } catch (error: any) {
    errorMessage("Failed to update profile", error);
  }
};
const deleteProfile = async (username: string) => {
  try {
    const data = await api.delete(`/profiles/${username}`);
    return data;
  } catch (error: any) {
    errorMessage("Failed to delete profile", error);
  }
};

const getAllProfiles = async () => {
  try {
    const data = await api.get("/profiles");
    return data;
  } catch (error: any) {
    errorMessage("Failed to get all profiles", error);
  }
};

const searchProfiles = async (query: string) => {
  try {
    const data = await api.get(`/profiles?search=${query}`);
    return data;
  } catch (error: any) {
    errorMessage("Failed to search profiles", error);
  }
};

const getProfileById = async (id: string) => {
  try {
    const data = await api.get(`/profiles/${id}`);
    if (!data) {
      throw new Error("Profile not found by id");
    }
    return data;
  } catch (error: any) {
    errorMessage("Failed to get profile by id", error);
  }
};

const getProfileByUsername = async (username: string): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from("Profiles")
    .select("*")
    .eq("username", username)
    .limit(1)
    .single();

  if (error) {
    errorMessage("Failed to get profile by username", error.message);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Profile not found by username");
  }

  return data as ProfileData;
};

const checkIfUserExists = async (username: string) => {
  const { data, error } = await supabase
    .from("Profiles")
    .select("id")
    .eq("username", username);

  if (error) {
    errorMessage("Failed to check if user exists", error.message);
    throw new Error(error.message);
  }

  return !!(data && data.length > 0);
};

const createProfile = async (profileData: ProfileData) => {
  const { username, password } = profileData;

  if (await checkIfUserExists(username)) {
    throw new Error("Username already exists");
  }

  const hashedPassword = hashString(password);
  profileData.password = hashedPassword;

  const { error } = await supabase.from("Profiles").insert([profileData]);

  if (error) {
    errorMessage("Failed to create profile", error.message);
    throw new Error(error.message);
  }

  const token = createDummyJWT(profileData);
  return token;
};

const profileLogin = async (profileData: LoginProfileData) => {
  const { username, password } = profileData;

  try {
    const profile = await getProfileByUsername(username);

    if (!verifyPassword(password, profile.password)) {
      throw new Error("Invalid password");
    }

    const token = createDummyJWT(profileData);

    return { profile, token };
  } catch (error: any) {
    errorMessage("Failed to login", error);
    throw error;
  }
};

const apiProfiles = {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
  searchProfiles,
  checkIfUserExists,
  getProfileByUsername,
  getProfileById,
  profileLogin,
};
export default apiProfiles;
