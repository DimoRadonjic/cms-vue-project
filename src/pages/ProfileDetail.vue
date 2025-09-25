<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "../store";
import type { ProfileData } from "../types/types";
import { AppInputPasswordField } from "../components/inputs";
import FormProfile from "../components/forms/FormProfile.vue";
import AppButtonDelete from "../components/ui/AppButtonDelete.vue";
import AppButton from "../components/ui/AppButton.vue";
import ModalConfirmation from "../modals/modalConfirmation.vue";
import { useAuth } from "../composable";
import AppSpinner from "../components/AppSpinner.vue";

const { getUser, getUserPassword } = useAuthStore();
const { deleteAccount } = useAuth();

const user = ref<ProfileData | null>(null);

const editing = ref(false);
const deleting = ref(false);
const refetch = ref(false);

const userDefault = {
  username: "",
  password: "",
  email: "",
};

const initialValue = ref<ProfileData>();

const getUserData = async () => {
  const fetchedUser = getUser();
  user.value = fetchedUser ?? null;
  const password = await getUserPassword();
  initialValue.value = fetchedUser ? { ...fetchedUser, password } : userDefault;
  refetch.value = false;
};

const deleteUser = async () => {
  if (!user.value) return;
  deleteAccount(user.value.email);
};

watch(
  () => refetch.value,
  () => {
    getUserData();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex place-content-center place-items-center h-full w-full">
    <div
      class="flex flex-col place-content-center place-items-center gap-8 w-full max-w-xl bg-primary backdrop-blur-md p-8 rounded-2xl shadow-xl border-2 border-primary"
    >
      <h1>User Profile</h1>

      <div v-if="!refetch" class="w-full">
        <FormProfile
          v-if="editing"
          v-model:editing="editing"
          v-model:initialValues="initialValue"
          v-model:refetch="refetch"
        />

        <div v-else class="space-y-6">
          <div class="space-y-4 text-xl">
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
              <div class="flex flex-col gap-2 w-full">
                <label class="font-semibold mb-1">Password:</label>
                <AppInputPasswordField
                  placeholder="Password"
                  fieldName="password"
                  :readonly="true"
                  :inputRoot="'!text-2xl !w-full'"
                  :initialValue="user?.password"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="flex place-content-evenly w-full">
            <AppButton
              label="Edit Profile"
              type="button"
              v-if="!editing"
              @click="editing = true"
              class="!bg-secondary px-4 py-2 !font-semibold !text-2xl"
            >
            </AppButton>

            <AppButtonDelete
              v-if="!editing"
              label="Delete Profile"
              @click="deleting = true"
              class="!bg-secondary px-4 py-2 !font-semibold !text-2xl"
            >
            </AppButtonDelete>
          </div>
        </div>
      </div>
      <AppSpinner v-else />
    </div>
    <ModalConfirmation
      v-model="deleting"
      :func="deleteUser"
    ></ModalConfirmation>
  </div>
</template>
