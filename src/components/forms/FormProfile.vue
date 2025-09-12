<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { ref } from "vue";
import { useToastService } from "../../composable/toastService/AppToastService";
import { auth } from "../../supabase/tables/tableProfiles";
import type { ProfileData } from "../../types/types";
import { useAuth } from "../../composable";

const { showError, showSuccess } = useToastService();
const { setUser } = useAuth();

const editing = defineModel<boolean>("editing", { default: false });
const refetch = defineModel<boolean>("refetch", { default: false });

const initialValues = defineModel<ProfileData>("initialValues", {
  default: { username: "", password: "", email: "" },
});

const change = ref<boolean>(false);

const testValue = (val: string, initial: string) => {
  return val.toLocaleLowerCase() === initial.toLocaleLowerCase()
    ? (change.value = false)
    : (change.value = true);
};

const onFormSubmit = async ({ values, valid }: FormSubmitEvent) => {
  if (!change) {
    showError("Update failed.", new Error("Nothing changed."), 3000);
    return;
  }

  if (!valid) {
    showError("Update failed.", new Error("Invalid fields"), 3000);
    return;
  }

  try {
    const user = await auth.updateUser(values as ProfileData);
    showSuccess("Your profile has been updated!");
    setUser(user);
    editing.value = false;
    refetch.value = true;
    return;
  } catch (error: any) {
    showError("Update failed.", error.message, 3000);
  }
};
</script>

<template>
  <Form
    @submit="onFormSubmit"
    :initial-values="initialValues"
    class="w-full space-y-4 text-xl flex flex-col place-content-center place-items-center"
  >
    <div class="flex flex-col place-content-center place-items-center w-full">
      <div class="flex flex-col gap-y-6 w-full">
        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full">
          <i key="sun" class="pi pi-user" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2 w-full">
            <label for="username" class="font-semibold mb-1">Username:</label>

            <AppInputTextField
              placeholder="Username"
              fieldName="username"
              :inputRoot="'!text-2xl !w-full'"
              :initialValue="initialValues.username"
              @update:modelValue="(value : string) => { testValue(value, initialValues.username)} "
              type="text"
            />
          </div>
        </div>

        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full">
          <i key="sun" class="pi pi-envelope" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2 w-full">
            <label for="email" class="font-semibold mb-1">Email:</label>

            <AppInputTextField
              placeholder="Email"
              fieldName="email"
              :inputRoot="'!text-2xl !w-full '"
              :initialValue="initialValues.email"
              @update:modelValue="(value : string) => { testValue(value, initialValues.email)} "
              type="email"
            />
          </div>
        </div>

        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full">
          <i key="sun" class="pi pi-unlock" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2 w-full">
            <label for="password" class="font-semibold mb-1">Password:</label>

            <AppInputPasswordField
              placeholder="Password"
              fieldName="password"
              :inputRoot="'!text-2xl !w-full'"
              :initialValue="initialValues.password"
              @update:modelValue="(value : string) => {  testValue(value, initialValues.password)} "
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-6">
      <Button
        v-if="!refetch"
        type="submit"
        :disabled="!change"
        class="bg-secondary px-4 py-2 font-semibold !text-2xl"
      >
        Save Changes
      </Button>
      <ProgressSpinner
        v-else
        style="width: 80px; height: 80px"
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
        aria-label="Custom ProgressSpinner"
      />
      <Button
        @click="editing = false"
        class="bg-secondary px-4 py-2 font-semibold !text-2xl"
      >
        Cancel
      </Button>
    </div>
  </Form>
</template>
