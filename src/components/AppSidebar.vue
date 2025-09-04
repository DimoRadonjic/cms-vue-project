<script setup lang="ts">
import { navLinks } from "../constants/nav-links";
import { useAuth } from "../composable";
import { ref } from "vue";

const { logout } = useAuth();

const visible = ref<boolean>(false);
const handleLogout = () => {
  visible.value = false;
  logout();
};
</script>

<template>
  <div class="card flex justify-content-center">
    <Sidebar
      v-model:visible="visible"
      class="!h-full flex flex-col place-content-between place-items-start py-14"
    >
      <template
        #container="{ closeCallback }"
        class="h-full flex place-items-center"
      >
        <div
          class="flex flex-col place-content-center gap-y-40 place-items-start h-full px-5"
        >
          <h1 class="text-4xl">Blog CMS</h1>
          <ul class="flex flex-col gap-y-12 place-items-start h-full text-2xl">
            <li
              v-for="link in navLinks"
              class="underline-animation"
              :key="link.label"
            >
              <router-link :to="{ name: link.routeName }">{{
                link.label
              }}</router-link>
            </li>
          </ul>
        </div>

        <div class="w-full">
          <div class="flex place-content-around w-full">
            <router-link to="/profile">
              <Button type="button" label="Profile" class="!text-2xl" />
            </router-link>
            <Button
              type="button"
              label="Logout"
              class="!text-2xl"
              @click="handleLogout"
            />
          </div>
        </div>
        <Button
          icon="pi pi-arrow-left"
          @click="closeCallback"
          class="!absolute -top-[1px] !m-0 -right-10 !rounded-l-none !bg-inherit !border-inherit !border-l-0 !text-emerald-500"
        />
      </template>
    </Sidebar>
    <Button
      icon="pi pi-arrow-right"
      @click="visible = true"
      class="h-12 my-auto"
    />
  </div>
</template>

<style lang="scss" scoped></style>
