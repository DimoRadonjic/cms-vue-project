<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "../store";
import type { ProfileData } from "../types/types";
import { Form } from "@primevue/forms";
import { AppInputTextField } from "../components/inputs";

const { getUser } = useProfileStore();

const user: ProfileData | null = getUser();

const editing = ref(false);

const initialValue = ref<ProfileData>(
  user ? { ...user } : { username: "", password: "", email: "" }
);
</script>

<template>
  <div class="flex place-content-center place-items-center h-full w-full">
    <div
      class="flex flex-col place-content-center place-items-center gap-8 w-fit bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary"
    >
      <h2 class="text-black text-2xl font-semibold text-center">
        User Profile
      </h2>

      <Form
        :initial-values="initialValue"
        v-if="editing"
        class="w-full min-w-sm"
      >
        <div
          class="flex flex-col place-content-center place-items-center w-full"
        >
          <div class="w-full max-w-lg grid grid-rows-3 gap-y-6">
            <div>
              <label class="font-semibold mb-1">Username:</label>

              <AppInputTextField
                placeholder="Username"
                fieldName="username"
                :initialValue="initialValue.username"
                type="text"
                readonly
              />
            </div>

            <div>
              <label class="font-semibold mb-1">Email:</label>

              <AppInputTextField
                placeholder="Email"
                fieldName="email"
                :initialValue="initialValue.email"
                type="email"
                readonly
              />
            </div>
            <div>
              <label class="font-semibold mb-1">Password:</label>

              <AppInputTextField
                placeholder="Password"
                fieldName="password"
                :initialValue="initialValue.password"
                type="text"
                readonly
              />
            </div>
          </div>
        </div>
      </Form>

      <div v-else class="space-y-4">
        <div class="flex flex-col">
          <label class="font-semibold mb-1">Username:</label>
          <p>{{ user?.username }}</p>
        </div>
        <div class="flex flex-col">
          <label class="font-semibold mb-1">Email:</label>
          <p>{{ user?.email }}</p>
        </div>
        <div class="flex flex-col">
          <label class="font-semibold mb-1">Password:</label>
          <p>{{ user?.password }}</p>
        </div>
      </div>

      <div class="flex place-content-center w-full">
        <Button
          v-if="!editing"
          @click="editing = true"
          class="bg-secondary px-4 py-2 font-semibold"
        >
          Edit Profile
        </Button>
        <div class="flex" v-else>
          <Button
            @click="editing = false"
            class="bg-secondary px-4 py-2 font-semibold"
          >
            Save Changes
          </Button>

          <Button
            @click="editing = false"
            class="bg-secondary px-4 py-2 font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
