<template>
  <GridLayout
    rows="auto"
    columns="auto"
    :style="containerStyle"
    :isEnabled="!disabled"
    @tap="onTap"
  >
    <NSvg :src="icon" stretch="aspectFit" :style="iconStyle" />
  </GridLayout>
</template>

<script setup>
import { computed } from "vue";
import { colors, resolveThemeColor } from "../theme";
import NSvg from "./NSvg.vue";
const props = defineProps({
  icon: { type: String, required: true },
  variant: { type: String, required: false, default: "primary" },
  size: { type: String, required: false, default: "md" },
  disabled: { type: Boolean, required: false, default: false }
});
const emit = defineEmits(["tap"]);
const diameters = { sm: 32, md: 44, lg: 56 };
const palette = computed(() => {
  if (props.disabled) return { background: colors.disabled, border: colors.disabled };
  if (props.variant === "outline") return { background: "transparent", border: colors.primary };
  if (props.variant === "ghost") return { background: "transparent", border: "transparent" };
  const themed = resolveThemeColor(props.variant);
  return { background: themed.background, border: themed.background };
});
const containerStyle = computed(() => {
  const diameter = diameters[props.size];
  return {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    backgroundColor: palette.value.background,
    borderColor: palette.value.border,
    borderWidth: props.variant === "outline" ? 1 : 0,
    opacity: props.disabled ? 0.7 : 1,
    horizontalAlignment: "left"
  };
});
const iconStyle = computed(() => {
  const iconSize = diameters[props.size] * 0.5;
  return {
    width: iconSize,
    height: iconSize,
    horizontalAlignment: "center",
    verticalAlignment: "middle"
  };
});
function onTap() {
  if (props.disabled) return;
  emit("tap");
}
</script>
