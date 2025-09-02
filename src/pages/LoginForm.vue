<script setup lang="ts">
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { reactive } from "vue";
import { z } from "zod";
import { useAuth } from "../composable";
import { useToastService } from "../composable/toastService/AppToastService";

const initialValues = reactive({
  username: "",
  password: "",
});

const { login } = useAuth();
const { showError } = useToastService();

const schema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const resolver = zodResolver(schema);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    showError("Login failed.", 3000);
    return;
  }
  const { username, password } = values;
  await login({ username, password });
};
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <Form
      :initialValues
      :resolver
      @submit="onFormSubmit"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      class="flex flex-col gap-8 w-full max-w-md bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
    >
      <h1 class="text-4xl pb-2 font-extrabold text-center">Login</h1>

      <div
        class="flex flex-col w-full place-content-center place-items-center gap-y-5"
      >
        <div class="w-full max-w-fit grid grid-rows-2 gap-y-6">
          <AppInputTextField
            placeholder="Username"
            fieldName="username"
            initialValue=""
            type="text"
          />

          <AppInputPasswordField
            placeholder="Password"
            fieldName="password"
            initialValue=""
          />
        </div>
        <div
          class="w-full flex flex-col place-content-center place-items-center gap-y-5"
        >
          <Button
            type="submit"
            label="Login"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          />

          <div
            class="flex flex-col items-center gap-3 gap-y-5 text-gray-700 text-base"
          >
            <p class="font-medium text-2xl">Don't have an account?</p>
            <router-link
              to="/register"
              class="w-full flex place-content-center"
            >
              <Button
                type="button"
                label="Register"
                pt:root="!text-2xl"
                class="w-fit py-3 rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              />
            </router-link>
          </div>
        </div>
      </div>
    </Form>
  </div>
</template>
