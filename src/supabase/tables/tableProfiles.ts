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

async function getPasswordByUsername(username: string) {
  const { data, error } = await supabase.rpc("decrypt_password_by_username", {
    user_name: username,
  });

  if (error) {
    console.error("Error decrypting password:", error);
    return null;
  }

  return data;
}

const updateUser = async (
  updates: ProfileData
): Promise<ProfileData | null> => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("email", updates.email)
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
  const { data, error } = await supabase.from(table).select("*").eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return data[0] as ProfileData;
};

const getUserByUsername = async (username: string): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileData;
};

const checkIfUserExistsByUsernameOrEmail = async (
  user: ProfileData
): Promise<void> => {
  const { username, email } = user;
  const { data, error } = await supabase
    .from(table)
    .select("id, username, email")
    .or(`username.eq.${username},email.eq.${email}`);

  if (error) {
    throw new Error("User check failed: " + error.message);
  }

  if (data && data.length > 0) {
    for (const existing of data) {
      if (existing.username === username)
        throw new Error("Username already exists");
      if (existing.email === email)
        throw new Error("User with that email already exists");
    }
  }
};

const registerUser = async (
  profileData: ProfileData
): Promise<{
  session: Session | null;
  user: ProfileData | null;
}> => {
  const { email, password, username } = profileData;

  await checkIfUserExistsByUsernameOrEmail(profileData);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase
      .from(table)
      .insert([{ ...profileData, id: user.id }]);

    if (profileError) throw new Error(profileError.message);
    const res = await loginUser({ username, password });
    if (res) {
      return { ...res };
    }
  }
  return {
    session: null,
    user: null,
  };
};

const loginUser = async (
  loginData: LoginProfileData
): Promise<{
  session: Session;
  user: ProfileData;
} | null> => {
  const { password, username } = loginData;

  const gottenUser = await getUserByUsername(username);

  if (!gottenUser) {
    throw new Error("No user found");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: gottenUser.email,
    password,
  });

  if (error) throw new Error(error.message);

  const user = await getUserByID(data.user.id);

  return { session: data.session, user: user };
};

export const auth = {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  refreshSession,
  getPasswordByUsername,
  getUserByID,
  getUserByUsername,
};
