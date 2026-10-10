<template>
  <Image v-if="src" :src="src" stretch="aspectFill" :style="imageStyle" />
  <GridLayout v-else rows="auto" columns="auto" :style="fallbackStyle">
    <Label :text="initials" :style="initialsStyle" />
  </GridLayout>
</template>

<script setup>
import { computed } from "vue";
import { colors } from "../theme";
const props = defineProps({
  src: { type: String, required: false, default: void 0 },
  name: { type: String, required: false, default: "" },
  size: { type: Number, required: false, default: 48 }
});
const imageStyle = computed(() => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2
}));
const fallbackStyle = computed(() => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  backgroundColor: colors.secondary,
  horizontalAlignment: "center",
  verticalAlignment: "middle"
}));
const initialsStyle = computed(() => ({
  color: colors.secondaryText,
  fontSize: props.size * 0.38,
  fontWeight: "600",
  textAlignment: "center",
  horizontalAlignment: "center",
  verticalAlignment: "middle"
}));
const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
});
</script>
