<template>
  <StackLayout>
    <Label v-if="label" :text="label" :style="labelStyle" />
    <TextField
      :text="modelValue"
      :hint="placeholder"
      :secure="secure"
      :editable="!disabled"
      :maxLength="maxLength"
      :style="fieldStyle"
      @text-change="onTextChange"
    />
    <Label v-if="error" :text="error" :style="errorStyle" />
  </StackLayout>
</template>

<script setup>
import { computed } from "vue";
import { colors, fontSizes, radii, spacing } from "../theme";
const props = defineProps({
  modelValue: { type: String, required: false, default: "" },
  label: { type: String, required: false, default: void 0 },
  placeholder: { type: String, required: false, default: void 0 },
  secure: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false },
  error: { type: String, required: false, default: void 0 },
  maxLength: { type: Number, required: false, default: void 0 }
});
const emit = defineEmits(["update:modelValue"]);
const labelStyle = {
  fontSize: fontSizes.sm,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xs
};
const fieldStyle = computed(() => ({
  backgroundColor: props.disabled ? colors.disabled : colors.surface,
  color: props.disabled ? colors.disabledText : colors.text,
  borderColor: props.error ? colors.danger : colors.border,
  borderWidth: 1,
  borderRadius: radii.sm,
  padding: spacing.sm,
  fontSize: fontSizes.md
}));
const errorStyle = {
  fontSize: fontSizes.xs,
  color: colors.danger,
  marginTop: spacing.xs
};
function onTextChange(args) {
  emit("update:modelValue", args.value);
}
</script>
