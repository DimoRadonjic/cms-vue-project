<template>
  <FormField
    :name="fieldName"
    :initialValue="initalValue ? initalValue : ''"
    class="flex flex-col gap-2 w-full"
    v-slot="{ invalid, error }"
    :key="fieldName + 'field'"
  >
    <InputText
      v-model="inputValue"
      :key="fieldName + ' input'"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="fieldName"
      :readonly="readonly"
      :pattern="inputPattern"
      @update:modelValue="(val) => update(val)"
      @focus="onFocus && onFocus($event)"
      @input="onInput && onInput($event)"
      :pt:root="inputRoot"
    />
    <Message
      v-if="invalid"
      severity="error"
      size="small"
      variant="simple"
      class="text-sm text-red-500"
    >
      {{ error?.message }}
    </Message>
  </FormField>
</template>

<script setup lang="ts">
import { ref } from "vue";

type InputTypes = "text" | "number" | "email";

const props = defineProps<{
  placeholder: string;
  type: InputTypes;
  fieldName: string;
  class?: string;
  inputRoot?: string;
  initalValue?: string | number;
  readonly?: boolean;
  inputPattern?: string;
  handleChange?: (e: any) => string;
  onFocus?: (e: FocusEvent) => void;
  onInput?: (e: Event) => void;
}>();

const inputValue = ref();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const update = (value: string | undefined) => {
  if (!value) return;
  const newValue = props.handleChange ? props.handleChange(value) : value;
  inputValue.value = newValue;
  emit("update:modelValue", newValue);
};
</script>

<style scoped></style>
