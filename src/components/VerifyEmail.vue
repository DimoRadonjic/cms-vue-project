<script setup lang="ts">
import { MailCheck } from "lucide-vue-next";
import { useAuth, useStorage } from "../composable";
import AppButton from "./ui/AppButton.vue";
import { useAppRouter } from "../composable/router/useAppRouter";
import { supabase } from "../supabase";
import { ref, onBeforeUnmount } from "vue";
import type { UUID } from "crypto";

const props = defineProps<{ userId: UUID }>();

const { navigateTo } = useAppRouter();
const { removeSessionItem } = useStorage();

const loading = ref(false);
const message = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const statusMessage = ref<string | null>(null);

const intervalId = ref<number | null>(null);

const checkVerification = async () => {
  message.value = "";
  statusMessage.value = "";
  errorMessage.value = "";

  loading.value = true;
  const { data, error } = await supabase.auth.admin.getUserById(props.userId);

  loading.value = false;

  if (error) {
    errorMessage.value = "Greška pri provjeri statusa.";
    return;
  }

  if (data.user?.email_confirmed_at) {
    message.value = "Email potvrđen! Možeš nastaviti.";
    removeSessionItem("verify");
    navigateTo("login");
  } else {
    errorMessage.value = "Tvoj email još nije potvrđen.";
  }
};

const resendVerification = async () => {
  errorMessage.value = "";
  message.value = "";
  statusMessage.value = "";

  loading.value = true;

  const { data } = await supabase.auth.admin.getUserById(props.userId);
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: data.user?.email || "",
  });

  if (error) {
    errorMessage.value = "Neuspjelo slanje emaila.";
  } else {
    statusMessage.value = "Novi verifikacioni email poslat!";
  }

  intervalId.value = window.setInterval(() => {
    loading.value = false;
  }, 10000);
};

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<template>
  <div
    class="p-6 max-w-md mx-auto text-center flex flex-col place-content-center place-items-center gap-5"
  >
    <MailCheck class="w-12 h-12 text-primary" />
    <h2 class="text-2xl font-bold mb-3">Verify your email</h2>
    <p>We’ve sent you a verification link to your email address.</p>
    <p>Click on it to activate your account.</p>

    <Message v-if="errorMessage" severity="error" variant="simple" size="small">
      {{ errorMessage }}
    </Message>

    <Message v-if="message" severity="success" variant="simple" size="small">
      {{ message }}
    </Message>

    <Message v-if="statusMessage" severity="info" variant="simple" size="small">
      {{ statusMessage }}
    </Message>

    <AppButton
      icon="icon flex place-content-center place-items-center !text-2xl pi pi-check-circle"
      label="Verified"
      type="button"
      @click="checkVerification"
    />

    <AppButton
      icon="icon flex place-content-center place-items-center !text-2xl pi pi-send"
      label="Resend email"
      :disabled="loading"
      type="button"
      @click="resendVerification"
    />
  </div>
</template>
