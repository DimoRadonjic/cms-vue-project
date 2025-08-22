import bcrypt from "bcryptjs";
import type { LoginProfileData, ProfileData } from "../../types/types";
import api from "./axios";
import { hashString, createDummyJWT, errorMessage } from "./utils";

const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};

const checkIfUserExists = async (username: string) => {
  const res = await api.get(`/profiles?username=${username}`);
  console.log("Checking if user exists:", res);
  return res.length > 0;
};

const createProfile = async (profileData: ProfileData) => {
  const { username, password } = profileData;

  if (await checkIfUserExists(username)) {
    throw new Error("Username already exists");
  }

  const hashedPassword = hashString(password);
  profileData.password = hashedPassword;

  try {
    await api.post("/profiles", profileData);

    const token = createDummyJWT(profileData);

    return token;
  } catch (error: any) {
    errorMessage("Failed to create profile", error);
  }
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

const getProfileByUsername = async (username: string): Promise<ProfileData> => {
  try {
    const data = await api.get(`/profiles?username=${username}`);
    if (data.length === 0) {
      throw new Error("Profile not found by username");
    }
    return data[0] as ProfileData;
  } catch (error: any) {
    errorMessage("Failed to get profile by username", error);
    throw error;
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

const profileLogin = async (profileData: LoginProfileData) => {
  const { username, password } = profileData;

  try {
    const profile: ProfileData = await getProfileByUsername(username);
    if (!profile) {
      throw new Error("Failed to login : profile not found");
    }
    if (!verifyPassword(password, profile.password)) {
      throw new Error("Invalid password");
    }

    const token = createDummyJWT(profileData);

    return { profile: profile, token: token };
  } catch (error: any) {
    errorMessage("Failed to login", error);
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
