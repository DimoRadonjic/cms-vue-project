import type { ProfileData, LoginProfileData } from "../../types/types";
import { errorMessage } from "../utils";
import { auth } from "../../supabase/tables/tableProfiles";

const registerUser = async (profileData: ProfileData) => {
  try {
    const res = await auth.registerUser(profileData);
    return res;
  } catch (error: any) {
    errorMessage("Failed to register user", error.message);
  }
};

const loginUser = async (loginData: LoginProfileData) => {
  try {
    const res = await auth.loginUser(loginData);
    return res;
  } catch (error: any) {
    errorMessage("Failed to login user", error.message);
  }
};

const getUserByID = async (id: string): Promise<ProfileData | undefined> => {
  try {
    const data = await auth.getUserByID(id);
    return data;
  } catch (error: any) {
    errorMessage(`Failed to fetch user with id: ${id}`, error.message);
  }
};

const getUserByUsername = async (
  username: string
): Promise<ProfileData | undefined> => {
  try {
    const data = await auth.getUserByUsername(username);
    return data;
  } catch (error: any) {
    errorMessage(
      `Failed to fetch user with username: ${username}`,
      error.message
    );
  }
};

const updateUser = async (profileData: ProfileData) => {
  try {
    const data = await auth.updateUser(profileData);
    return data;
  } catch (error: any) {
    errorMessage(
      `Failed to update user with email: ${profileData.email}`,
      error
    );
  }
};

const deleteUser = async (id: string) => {
  try {
    const success = await auth.deleteUser(id);
    return success;
  } catch (error: any) {
    errorMessage(`Failed to delete user with id: ${id}`, error.message);
  }
};

const getPasswordByUsername = async (username: string) => {
  try {
    const data = await auth.getPasswordByUsername(username);
    return data;
  } catch (error: any) {
    errorMessage(
      `Failed to get password for username: ${username}`,
      error.message
    );
  }
};

const refreshSession = async () => {
  try {
    const data = await auth.refreshSession();
    return data;
  } catch (error: any) {
    errorMessage("Failed to refresh session", error.message);
  }
};

const apiProfiles = {
  registerUser,
  loginUser,
  getUserByID,
  getUserByUsername,
  updateUser,
  deleteUser,
  getPasswordByUsername,
  refreshSession,
};

export default apiProfiles;
