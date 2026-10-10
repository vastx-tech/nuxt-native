<template>
  <StackLayout :style="dividerStyle" />
</template>

<script setup>
import { computed } from "vue";
import { colors, spacing } from "../theme";
const props = defineProps({
  color: { type: String, required: false, default: colors.border },
  thickness: { type: Number, required: false, default: 1 },
  margin: { type: null, required: false, default: "md" },
  orientation: { type: String, required: false, default: "horizontal" }
});
const dividerStyle = computed(() => {
  const isHorizontal = props.orientation === "horizontal";
  return {
    backgroundColor: props.color,
    width: isHorizontal ? "100%" : props.thickness,
    height: isHorizontal ? props.thickness : "100%",
    marginTop: isHorizontal ? spacing[props.margin] : 0,
    marginBottom: isHorizontal ? spacing[props.margin] : 0,
    marginLeft: isHorizontal ? 0 : spacing[props.margin],
    marginRight: isHorizontal ? 0 : spacing[props.margin]
  };
});
</script>
