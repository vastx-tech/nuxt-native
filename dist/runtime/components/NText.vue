<template>
  <Label :text="text" :style="labelStyle" :textWrap="wrap" />
</template>

<script setup>
import { computed } from "vue";
import { colors, fontSizes } from "../theme";
const props = defineProps({
  text: { type: String, required: false, default: "" },
  variant: { type: String, required: false, default: "body" },
  color: { type: String, required: false, default: void 0 },
  weight: { type: String, required: false, default: void 0 },
  align: { type: String, required: false, default: "left" },
  wrap: { type: Boolean, required: false, default: true }
});
const variantMetrics = {
  h1: { fontSize: fontSizes["3xl"], fontWeight: "700", color: colors.text },
  h2: { fontSize: fontSizes["2xl"], fontWeight: "700", color: colors.text },
  h3: { fontSize: fontSizes.xl, fontWeight: "600", color: colors.text },
  body: { fontSize: fontSizes.md, fontWeight: "400", color: colors.text },
  caption: { fontSize: fontSizes.sm, fontWeight: "400", color: colors.textMuted },
  label: { fontSize: fontSizes.sm, fontWeight: "600", color: colors.text }
};
const weightMap = { normal: "400", medium: "500", semibold: "600", bold: "700" };
const labelStyle = computed(() => {
  const metrics = variantMetrics[props.variant];
  return {
    fontSize: metrics.fontSize,
    fontWeight: props.weight ? weightMap[props.weight] : metrics.fontWeight,
    color: props.color ?? metrics.color,
    textAlignment: props.align
  };
});
</script>
