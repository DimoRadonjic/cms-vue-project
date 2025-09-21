<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { reactive, ref } from "vue";
import { useAuth } from "../../composable";
import { useToastService } from "../../composable/toastService/AppToastService";
import { schemaLogin } from "./schemas";
import ActionLoading from "../ActionLoading.vue";

const initialValues = reactive({
  username: "",
  password: "",
});

const { login } = useAuth();
const { showError } = useToastService();

const resolver = zodResolver(schemaLogin);

const logging = ref<boolean>(false);

const errorMessage = ref<string>("");

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    showError("Login failed.", "form is invalid", 3000);
    return;
  }
  logging.value = true;

  const { username, password } = values;

  try {
    await login({ username, password });
  } catch (error: any) {
    errorMessage.value = error.message;
    logging.value = false;
  }
};
</script>

<template>
  <Form
    :initialValues
    :resolver
    @submit="onFormSubmit"
    :validateOnValueUpdate="true"
    :validateOnBlur="true"
    class="flex flex-col gap-8 w-full max-w-md bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
  >
    <h1 v-if="!logging" class="text-4xl pb-2 font-extrabold text-center">
      Login
    </h1>

    <ActionLoading v-if="logging" :action="logging" header="Logging you in" />

    <div
      v-else
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
        <Message
          v-if="errorMessage"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ errorMessage }}
        </Message>
        <Button
          type="submit"
          label="Login"
          pt:root="!text-2xl"
          class="w-fit py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        />

        <div class="flex flex-col items-center gap-3 gap-y-5 text-base">
          <p class="font-medium text-2xl">Don't have an account?</p>
          <router-link to="/register" class="w-full flex place-content-center">
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
</template>
