<template>
  <GridLayout
    rows="auto"
    columns="auto"
    :style="containerStyle"
    :isEnabled="!disabled && !loading"
    accessibilityRole="button"
    v-on="isAndroid ? { loaded: onLoaded } : { tap: onTap }"
  >
    <ActivityIndicator v-if="loading" busy="true" :color="palette.text" width="20" height="20" />
    <slot v-else-if="$slots.default" />
    <Label v-else :text="text" :style="labelStyle" textWrap="false" />
  </GridLayout>
</template>

<script setup>
import { computed, onBeforeUnmount } from "vue";
import { isAndroid } from "@nativescript/core";
import { attachNativeClick } from "../native-tap";
import { colors, fontSizes, radii, resolveThemeColor, spacing } from "../theme";
const props = defineProps({
  text: { type: String, required: false, default: "" },
  variant: { type: String, required: false, default: "primary" },
  size: { type: String, required: false, default: "md" },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false }
});
const emit = defineEmits(["tap"]);
const sizeMetrics = {
  sm: { paddingV: spacing.xs, paddingH: spacing.md, fontSize: fontSizes.sm },
  md: { paddingV: spacing.sm, paddingH: spacing.lg, fontSize: fontSizes.md },
  lg: { paddingV: spacing.md, paddingH: spacing.xl, fontSize: fontSizes.lg }
};
const palette = computed(() => {
  if (props.disabled) return { background: colors.disabled, text: colors.disabledText, border: colors.disabled };
  if (props.variant === "outline") return { background: "transparent", text: colors.primary, border: colors.primary };
  if (props.variant === "ghost") return { background: "transparent", text: colors.primary, border: "transparent" };
  const themed = resolveThemeColor(props.variant);
  return { ...themed, border: themed.background };
});
const containerStyle = computed(() => {
  const metrics = sizeMetrics[props.size];
  return {
    backgroundColor: palette.value.background,
    borderColor: palette.value.border,
    borderWidth: props.variant === "outline" ? 1 : 0,
    borderRadius: radii.md,
    paddingTop: metrics.paddingV,
    paddingBottom: metrics.paddingV,
    paddingLeft: metrics.paddingH,
    paddingRight: metrics.paddingH,
    opacity: props.disabled ? 0.7 : 1,
    horizontalAlignment: "left"
  };
});
const labelStyle = computed(() => ({
  color: palette.value.text,
  fontSize: sizeMetrics[props.size].fontSize,
  fontWeight: "600",
  textAlignment: "center"
}));
function onTap() {
  if (props.disabled || props.loading) return;
  emit("tap");
}
let detach;
function onLoaded(args) {
  if (detach) return;
  const filled = props.variant !== "outline" && props.variant !== "ghost";
  const rippleColor = filled ? 872415231 : 31 << 24 | Number.parseInt(colors.primary.slice(1), 16) & 16777215;
  detach = attachNativeClick(args.object, onTap, { rippleColor, cornerRadius: radii.md });
}
onBeforeUnmount(() => detach?.());
</script>
