<script setup lang="ts">
import AppButton from "../components/ui/AppButton.vue";
import AppButtonDelete from "../components/ui/AppButtonDelete.vue";
import ModalBase from "./modalBase.vue";

defineProps<{
  func: Function;
}>();

const modalOpen = defineModel({ default: false });
</script>

<template>
  <ModalBase v-model:modalOpen="modalOpen" :modalTitle="'Are you sure ?'">
    <template #body>
      <div class="bg-primary h-fit w-full flex place-content-evenly rounded-xl">
        <AppButton
          type="button"
          label="Yes"
          rootClass="!text-lg !p-2"
          @click="() => func()"
        ></AppButton>

        <AppButtonDelete
          type="button"
          :noIcon="true"
          label="No"
          rootClass="!text-lg !p-2"
          @click="modalOpen = false"
        ></AppButtonDelete>
      </div>
    </template>
  </ModalBase>
</template>

<style scoped></style>
