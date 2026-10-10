<template>
  <StackLayout :style="baseStyle">
    <StackLayout ref="bandRef" :style="bandStyle" />
  </StackLayout>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { colors } from "../theme";
import { box, opacity, resolveColor, resolveLength, size, tint } from "../style";
const props = defineProps({
  width: { type: null, required: true },
  height: { type: null, required: true },
  radius: { type: null, required: false, default: "sm" },
  color: { type: null, required: false, default: colors.disabled },
  highlightColor: { type: null, required: false, default: void 0 },
  duration: { type: Number, required: false, default: 1200 }
});
const bandRef = ref(null);
let animation;
const widthDip = computed(() => resolveLength(props.width));
const bandWidthDip = computed(() => Math.max(widthDip.value * 0.5, 24));
const baseStyle = computed(() => ({
  ...size({ width: props.width, height: props.height }),
  ...box({ background: resolveColor(props.color), radius: props.radius, clipPath: "inset(0)" })
}));
const bandStyle = computed(() => {
  const highlight = props.highlightColor ?? tint(props.color, 0.9);
  return {
    width: bandWidthDip.value,
    height: "100%",
    translateX: -bandWidthDip.value,
    backgroundImage: `linear-gradient(to right, ${opacity(highlight, 0)}, ${opacity(highlight, 0.55)}, ${opacity(highlight, 0)})`
  };
});
onMounted(() => {
  const band = bandRef.value;
  if (!band) return;
  animation = band.animate({
    translate: { x: widthDip.value + bandWidthDip.value, y: 0 },
    duration: props.duration,
    iterations: Number.POSITIVE_INFINITY,
    curve: "linear"
  });
  animation.catch(() => {
  });
});
onUnmounted(() => {
  animation?.cancel();
});
</script>
