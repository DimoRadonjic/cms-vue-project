<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { FormSubmitEvent, ProfileData } from "../../types/types";
import { useToastService } from "../../composable/toastService/AppToastService";
import { schemaRegister } from "./schemas";
import { useAuth } from "../../composable";
import { ref } from "vue";

const { showError } = useToastService();
const { register } = useAuth();

const initialValues = {
  username: "",
  email: "",
  password: "",
  retypepassword: "",
};

const resolver = zodResolver(schemaRegister);

const registering = ref<boolean>(false);

const onFormSubmit = async ({ values, valid }: FormSubmitEvent) => {
  if (!valid) {
    showError("Registration is invalid.", 3000);
    return;
  }
  const data: ProfileData = {
    username: values.username,
    email: values.email,
    password: values.password,
  };
  registering.value = true;

  await register(data);
  registering.value = false;
};
</script>

<template>
  <Form
    :initialValues
    :resolver
    @submit="onFormSubmit"
    :validateOnValueUpdate="true"
    :validateOnBlur="true"
    :class="` flex flex-col gap-8 w-full  bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary ${
      registering ? 'max-w-lg' : 'max-w-md'
    }`"
  >
    <h1
      v-if="!registering"
      class="text-4xl pb-2 font-extrabold text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
    >
      Register
    </h1>

    <div
      v-if="registering"
      class="mx-auto flex place-content-center place-items-center flex-col gap-12"
    >
      <h1 class="mt-4 text-lg font-medium animate-pulse">
        Registering you in<span class="loading-dots"></span>
      </h1>

      <ProgressSpinner
        style="width: 80px; height: 80px"
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
        aria-label="Custom ProgressSpinner"
      />
    </div>

    <div v-else class="flex flex-col gap-y-8">
      <div class="flex flex-col gap-y-8">
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
      </div>

      <div class="flex flex-col content-start items-center gap-8">
        <Button
          type="submit"
          label="Register"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />

        <p class="font-medium text-2xl">Already have an account ?</p>

        <router-link to="/login">
          <Button
            type="button"
            label="Login"
            pt:root="!text-2xl"
            class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          />
        </router-link>
      </div>
    </div>
  </Form>
</template>

<style scoped>
@keyframes dots {
  0% {
    content: "";
  }
  33% {
    content: ".";
  }
  66% {
    content: "..";
  }
  100% {
    content: "...";
  }
}

.loading-dots::after {
  display: inline-block;
  content: "";
  animation: dots 1.2s steps(3, end) infinite;
}
</style>
