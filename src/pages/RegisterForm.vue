<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import apiProfiles from "../axios/api/profiles";
import type { FormSubmitEvent, ProfileData } from "../types/types";
import { useSessionStorage } from "../composable";
import { useToastService } from "../composable/toastService/AppToastService";
import { useAppRouter } from "../composable/router/useAppRouter";

const { showError, showSuccess } = useToastService();
const { navigateTo } = useAppRouter();
const { setItem } = useSessionStorage();

const initialValues = {
  username: "",
  email: "",
  password: "",
  retypepassword: "",
};

const schema = z
  .object({
    username: z.string().min(1, {
      message: "Username is required.",
    }),
    email: z.string().min(1, {
      message: "Email is required.",
    }),
    password: z
      .string()
      .min(1, {
        message: "Password is required.",
      })
      .min(8, {
        message: "Minimum password length is 8 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    retypepassword: z
      .string()
      .min(1, { message: "Please retype your password." }),
  })
  .refine((data) => data.password === data.retypepassword, {
    path: ["retypepassword"],
    message: "Passwords do not match.",
  });

const resolver = zodResolver(schema);

const onFormSubmit = async (e: FormSubmitEvent) => {
  const { valid, values } = e;

  if (valid) {
    try {
      const data: ProfileData = {
        username: values.username,
        email: values.email,
        password: values.password,
      };
      const token = await apiProfiles.createProfile(data);

      setItem("token", token);

      showSuccess("Registration successful.", 3000);
      navigateTo("dashboard");
    } catch (error) {
      showError("Registration failed.", 3000);

      return;
    }
  } else {
    showError("Registration is invalid.", 3000);
  }
};
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center">
    <Form
      :initialValues
      :resolver
      @submit="onFormSubmit"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      class="flex flex-col gap-4 max-w-md bg-primary p-6 rounded-lg shadow-lg text-2xl place-content-center-safe place-items-center-safe"
    >
      <h1>Register</h1>

      <AppInputTextField
        placeholder="Username"
        fieldName="username"
        initialValue=""
        type="text"
      />

      <AppInputTextField
        placeholder="Email"
        fieldName="email"
        initialValue=""
        type="email"
      />

      <AppInputPasswordField
        placeholder="Password"
        fieldName="password"
        initialValue=""
      />

      <AppInputPasswordField
        placeholder="Retype Password"
        fieldName="retypepassword"
        initialValue=""
      />
      <Button
        type="submit"
        label="Register"
        pt:root="!text-2xl"
        class="w-fit py-3 rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
      />

      <div class="flex flex-col content-start items-center gap-2s">
        <p>Already have an account ?</p>
        <router-link to="/login">
          <Button
            type="button"
            label="Login"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          />
        </router-link>
      </div>
    </Form>
  </div>
</template>
