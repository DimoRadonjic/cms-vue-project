<script setup lang="ts">
import { watch ,ref} from "vue";
import { useAppRouter } from "../composable/router/useAppRouter";

const props = defineProps<{
  itemSelected: any[];
  title: string;
}>();

const {navigateTo} = useAppRouter();

const handleDeletion = () => {
  // Logic to handle deletion of selected images
};

function setDeleteLabel() {
  return props.itemSelected && props.itemSelected.length > 0 ? `Delete ${props.itemSelected.length}` : "No item selected"
}

const deleteLabel = ref(setDeleteLabel()); ;

watch(() => props.itemSelected, () => {
  deleteLabel.value = setDeleteLabel();
});
</script>

<template>
  <div
    class="flex flex-wrap md:grid md:grid-cols-3 w-full h-full place-items-center place-content-between md:place-content-center gap-6 px-3 relative"
  >
    <h1 class="text-4xl font-bold md:col-start-2 md:col-end-2 md:w-full text-start md:text-center capitalize">
      {{ title }}
    </h1>
    <p class="text-2xl font-bold ml-0 md:ml-auto md:col-start-3 md:col-end-3">
        <div class="flex w-full place-items-center place-content-between md:gap-x-4 gap-x-2  relative">
            <Button
              label="New"
              icon="pi pi-plus"
              class="mr-2"
              @click="navigateTo('new-image')"

            />
            <Button
              :label="
               deleteLabel
              "
              icon="pi pi-trash"
              severity="danger"
              variant="outlined"
              :disabled="!itemSelected || itemSelected.length === 0"
              @click="handleDeletion()"

            />
              <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="$emit('refetch')"
            />
        </div>
    </p>
  </div>
</template>





