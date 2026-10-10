<template>
  <Switch
    :checked="modelValue"
    :isEnabled="!disabled"
    :color="color"
    :offBackgroundColor="offColor"
    @checked-change="onCheckedChange"
  />
</template>

<script setup>
import { colors } from "../theme";
defineProps({
  modelValue: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false },
  color: { type: String, required: false, default: colors.primary },
  offColor: { type: String, required: false, default: colors.border }
});
const emit = defineEmits(["update:modelValue"]);
function onCheckedChange(args) {
  emit("update:modelValue", args.value);
}
</script>
