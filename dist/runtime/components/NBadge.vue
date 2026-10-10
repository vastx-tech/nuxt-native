<template>
  <StackLayout :style="badgeStyle">
    <Label :text="text" :style="labelStyle" textWrap="false" />
  </StackLayout>
</template>

<script setup>
import { computed } from "vue";
import { fontSizes, radii, resolveThemeColor, spacing } from "../theme";
const props = defineProps({
  text: { type: String, required: false, default: "" },
  variant: { type: String, required: false, default: "primary" }
});
const palette = computed(() => resolveThemeColor(props.variant));
const badgeStyle = computed(() => ({
  backgroundColor: palette.value.background,
  borderRadius: radii.full,
  paddingTop: spacing.xs / 2,
  paddingBottom: spacing.xs / 2,
  paddingLeft: spacing.sm,
  paddingRight: spacing.sm,
  horizontalAlignment: "left"
}));
const labelStyle = computed(() => ({
  color: palette.value.text,
  fontSize: fontSizes.xs,
  fontWeight: "600",
  textAlignment: "center"
}));
</script>
