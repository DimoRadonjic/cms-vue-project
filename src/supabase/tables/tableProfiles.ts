import { TableName } from ".";
import { supabase } from "..";
import type { LoginProfileData, ProfileData } from "../../types/types";
import type { Session, User } from "@supabase/supabase-js";

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

const deleteUserByEmail = async (email: string) => {
  const { data: user, error: userError } = await supabase
    .from(table)
    .select()
    .eq("email", email);

  if (userError) {
    console.error("Error deleting user by email:", userError.message);
    return false;
  }
  const { error } = await supabase.from(table).delete().eq("email", email);

  if (error) {
    console.error("Error deleting user by email:", error.message);
    return false;
  }

  await supabase.auth.admin.deleteUser(user[0].id);

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

const supabaseGetUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    return data.users.filter((user) => user.email === email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const supabaseRegister = async (email: string, password: string) => {
  try {
    const { data } = await supabase.auth.signUp({
      email,
      password,
    });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const insertNewUser = async (profileData: ProfileData, id: string) => {
  try {
    await supabase.from(table).insert([{ ...profileData, id }]);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const registerUser = async (
  profileData: ProfileData
): Promise<{
  session: Session | null;
  user: User | null;
} | null> => {
  const { email, password } = profileData;

  try {
    await checkIfUserExistsByUsernameOrEmail(profileData);

    const { session, user } = await supabaseRegister(email, password);
    if (user) {
      await insertNewUser(profileData, user.id);
    }

    return { session, user };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const loginUser = async (
  loginData: LoginProfileData
): Promise<{
  session: Session;
  user: ProfileData;
  verified: boolean;
}> => {
  const { password, username } = loginData;

  try {
    const gottenUser = await getUserByUsername(username);

    console.log("got", gottenUser);

    if (!gottenUser) {
      throw new Error("No user found");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: gottenUser.email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const verified =
      data.user?.identities?.[0]?.identity_data?.email_verified ?? false;

    const user = await getUserByID(data.user.id);

    return { session: data.session, user, verified };
  } catch (err: any) {
    throw new Error(err.message);
  }
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
  deleteUserByEmail,
  supabaseGetUserByEmail,
};
