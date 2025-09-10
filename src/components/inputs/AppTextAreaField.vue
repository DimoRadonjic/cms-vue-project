<template>
  <FormField
    v-slot="$field"
    :name="fieldName"
    :initialValue="initalValue ? initalValue : ''"
    class="flex flex-col gap-2 w-full"
  >
    <Textarea
      v-model="inputValue"
      @update:modelValue="(val) => update(val)"
      rows="5"
      cols="30"
      :placeholder
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
import { ref } from "vue";

const props = defineProps<{
  placeholder: string;
  fieldName: string;
  class?: string;
  inputRoot?: string;
  initalValue?: string | number;
  handleChange?: (e: any) => string;

  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputValue = ref();

const update = (value: string | undefined) => {
  if (!value) return;
  const newValue = props.handleChange ? props.handleChange(value) : value;
  inputValue.value = newValue;
  emit("update:modelValue", newValue);
};
</script>

<style scoped></style>
