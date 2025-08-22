<template>
  <div class="flex place-content-center place-items-center h-full">
    <div
      class="bg-neutral-300 w-fit px-20 py-10 space-y-10 rounded-2xl h-[90%]"
    >
      <h2 class="text-black text-2xl font-semibold text-center">
        User Profile
      </h2>

      <Form :initial-values="initialValue">
        <div class="flex flex-col">
          <AppInputTextField
            placeholder="Username"
            fieldName="username"
            :initialValue="initialValue.username"
            type="text"
            readonly
          />

          <AppInputTextField
            placeholder="Email"
            fieldName="email"
            :initialValue="initialValue.email"
            type="email"
            readonly
          />
          <AppInputTextField
            placeholder="Password"
            fieldName="password"
            :initialValue="initialValue.password"
            type="text"
            readonly
          />
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "../store";
import type { ProfileData } from "../types/types";
import { Form } from "@primevue/forms";
import { AppInputTextField } from "../components/inputs";

const { getUser } = useProfileStore();

const user: ProfileData | null = getUser();

const initialValue = ref<ProfileData>(
  user ? { ...user } : { username: "", password: "", email: "" }
);
</script>
