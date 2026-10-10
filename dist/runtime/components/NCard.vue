<template>
  <StackLayout :style="cardStyle">
    <slot />
  </StackLayout>
</template>

<script setup>
import { computed } from "vue";
import { colors, radii, spacing } from "../theme";
const props = defineProps({
  padding: { type: null, required: false, default: "lg" },
  elevated: { type: Boolean, required: false, default: true },
  background: { type: String, required: false, default: void 0 }
});
const cardStyle = computed(() => ({
  backgroundColor: props.background ?? colors.surface,
  borderRadius: radii.md,
  padding: spacing[props.padding],
  // boxShadow takes a CSS box-shadow string (confirmed against
  // @nativescript/core's ShadowCSSValues/parseCSSShadow) — support and
  // exact rendering vary by platform, so this is left off entirely
  // rather than shipping a shadow that looks wrong on one of them.
  ...props.elevated ? { boxShadow: "0 1 3 rgba(15, 23, 42, 0.12)" } : {},
  borderWidth: props.elevated ? 0 : 1,
  borderColor: colors.border
}));
</script>
