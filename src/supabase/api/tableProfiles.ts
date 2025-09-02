import { TableName } from ".";
import { supabase } from "..";
import type { LoginProfileData, ProfileData } from "../../types/types";
import type { Session } from "@supabase/supabase-js";

const table = TableName.profiles;

const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error("Error refreshing session:", error.message);
    return null;
  }

  return data.session;
};

const updateUser = async (
  id: string,
  updates: ProfileData
): Promise<ProfileData | null> => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error.message);
    return null;
  }
  return data;
};
const deleteUser = async (id: string) => {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    console.error("Error deleting user:", error.message);
    return false;
  }
  return true;
};

const getUserByID = async (id: string): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileData;
};

const getUserByUsername = async (
  username: string
): Promise<ProfileData | null> => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileData | null;
};

const checkIfUserExistsByUsername = async (
  user: ProfileData
): Promise<{ result: boolean; error: string }> => {
  const { username, email } = user;
  const { data: existing, error } = await supabase
    .from(table)
    .select("id, username, email")
    .or(`username.eq.${username},email.eq.${email}`)
    .maybeSingle();

  if (error) {
    throw new Error("User check failed: " + error.message);
  }

  if (existing) {
    if (existing.username === username) {
      return { result: true, error: "Username already exists" };
    }

    if (existing.email === email) {
      return { result: true, error: "User with that email already exists" };
    }
  }
  return { result: false, error: "" };
};

const registerUser = async (
  profileData: ProfileData
): Promise<{
  session: Session;
  user: ProfileData;
} | null> => {
  const { email, password, username } = profileData;
  // const { result, error: checkError } = await checkIfUserExistsByUsername(
  //   userRegister
  // );
  // if (result) {
  //   throw new Error(checkError);
  // }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase
      .from(table)
      .insert([profileData]);

    if (profileError) throw new Error(profileError.message);
    const res = await loginUser({ username, password });

    return res;
  }
  return null;
};

const loginUser = async (
  loginData: LoginProfileData
): Promise<{
  session: Session;
  user: ProfileData;
} | null> => {
  const { password, username } = loginData;
  const gottenUser = await getUserByUsername(username);

  if (gottenUser) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: gottenUser.email,
      password,
    });

    if (error) throw new Error(error.message);

    const user = await getUserByID(data.user.id);

    return { session: data.session, user };
  }
  return null;
};

export const auth = {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  refreshSession,
};
