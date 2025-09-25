import bcrypt from "bcryptjs";
import type { LoginProfileData } from "../types/types";
import { debounce } from "lodash";

export const baseUrl = import.meta.env.VITE_API_BASE_URL;

const secretSignature = import.meta.env.VITE_SECRET_SIGNUTRE;

export function errorMessage(message: string, error?: any) {
  console.error(message, error);

  if (error && typeof error === "object") {
    if (Array.isArray(error)) {
      console.error("Error array:", error);
    } else {
      console.error("Error object:", JSON.stringify(error, null, 2));
    }
  } else {
    console.error("Error string:", String(error));
  }
}
export const salt = bcrypt.genSaltSync(10);

export const hashString = (str: string) => {
  return bcrypt.hashSync(str, salt);
};

const base64Encode = (obj: object) => btoa(JSON.stringify(obj));

export const createDummyJWT = ({ username, password }: LoginProfileData) => {
  const header = { alg: "RSA", typ: "JWT" };
  const payload = { username, password, iat: Date.now() };

  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(payload);
  const signature = secretSignature;

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const debouncedSearch = debounce(
  async (callback: any, search: string) => {
    try {
      const data = await callback(search);
      return data;
    } catch (error) {}
  },
  400
);
