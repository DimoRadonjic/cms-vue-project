<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store";
import type { ProfileData } from "../types/types";
import { Form } from "@primevue/forms";
import { AppInputTextField } from "../components/inputs";

const { getUser } = useAuthStore();

const user: ProfileData | null = getUser();

const editing = ref(false);

const initialValue = ref<ProfileData>(
  user ? { ...user } : { username: "", password: "", email: "" }
);
</script>

<template>
  <div class="flex place-content-center place-items-center h-full w-full">
    <div
      class="flex flex-col place-content-center place-items-center gap-8 w-full max-w-xl bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border-2 border-primary"
    >
      <h1>User Profile</h1>

      <Form
        :initial-values="initialValue"
        v-if="editing"
        class="w-full space-y-4 text-xl"
      >
        <div
          class="flex flex-col place-content-center place-items-center w-full"
        >
          <div class="flex flex-col gap-y-6 w-full">
            <div
              class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full"
            >
              <i key="sun" class="pi pi-user" style="font-size: 2rem"></i>
              <div class="flex flex-col gap-2 w-full">
                <label for="username" class="font-semibold mb-1"
                  >Username:</label
                >

                <AppInputTextField
                  placeholder="Username"
                  fieldName="username"
                  :inputRoot="'!text-2xl !w-full'"
                  :initialValue="initialValue.username"
                  type="text"
                />
              </div>
            </div>

            <div
              class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full"
            >
              <i key="sun" class="pi pi-envelope" style="font-size: 2rem"></i>
              <div class="flex flex-col gap-2 w-full">
                <label for="email" class="font-semibold mb-1">Email:</label>

                <AppInputTextField
                  placeholder="Email"
                  fieldName="email"
                  :inputRoot="'!text-2xl !w-full '"
                  :initialValue="initialValue.email"
                  type="email"
                />
              </div>
            </div>

            <div
              class="flex gap-4 border-2 rounded-2xl p-6 border-primary w-full"
            >
              <i key="sun" class="pi pi-unlock" style="font-size: 2rem"></i>
              <div class="flex flex-col gap-2 w-full">
                <label for="password" class="font-semibold mb-1"
                  >Password:</label
                >

                <AppInputTextField
                  placeholder="Password"
                  fieldName="password"
                  :inputRoot="'!text-2xl !w-full'"
                  :initialValue="initialValue.password"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </Form>

      <div v-else class="space-y-4 text-xl">
        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary">
          <i key="sun" class="pi pi-user" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2">
            <label class="font-semibold mb-1">Username:</label>
            <p>{{ user?.username }}</p>
          </div>
        </div>

        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary">
          <i key="sun" class="pi pi-envelope" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2">
            <label class="font-semibold mb-1">Email:</label>
            <p>{{ user?.email }}</p>
          </div>
        </div>

        <div class="flex gap-4 border-2 rounded-2xl p-6 border-primary">
          <i key="sun" class="pi pi-lock" style="font-size: 2rem"></i>
          <div class="flex flex-col gap-2">
            <label class="font-semibold mb-1">Password:</label>
            <p>{{ user?.password }}</p>
          </div>
        </div>
      </div>

      <div class="flex place-content-center w-full">
        <Button
          v-if="!editing"
          @click="editing = true"
          class="!bg-secondary px-4 py-2 !font-semibold !text-2xl"
        >
          Edit Profile
        </Button>
        <div class="flex gap-6" v-else>
          <Button
            @click="editing = false"
            class="bg-secondary px-4 py-2 font-semibold !text-2xl"
          >
            Save Changes
          </Button>

          <Button
            @click="editing = false"
            class="bg-secondary px-4 py-2 font-semibold !text-2xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
