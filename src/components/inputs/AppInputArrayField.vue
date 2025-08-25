<template>
  <FormField
    v-slot="$field"
    :name="fieldName"
    :initialValue="initalValue ? initalValue : ''"
    class="flex flex-col gap-2 w-full"
  >
    <InputText
      :type
      :placeholder
      :autocomplete="fieldName"
      :readonly
      :pt:root="
        inputRoot
          ? '!text-lg rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 hover:shadow-md ' +
            inputRoot
          : '!text-lg rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 hover:shadow-md'
      "
    />

    <Message
      v-if="$field?.invalid"
      severity="error"
      size="small"
      variant="simple"
      class="text-sm text-red-500"
    >
      {{ $field.error?.message }}
    </Message>
  </FormField>
</template>

<script setup lang="ts">
type InputTypes = "text" | "number";

defineProps<{
  placeholder: string;
  type: InputTypes;
  fieldName: string;
  class?: string;
  inputRoot?: string;
  initalValue?: string[] | number[];
  readonly?: boolean;
}>();
</script>

<style scoped></style>
