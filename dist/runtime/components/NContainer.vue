<template>
  <ContentView :style="containerStyle">
    <slot />
  </ContentView>
</template>

<script setup>
import { computed } from "vue";
import { align as alignStyle, box, margin as marginStyle, padding as paddingStyle, size } from "../style";
const props = defineProps({
  padding: { type: null, required: false },
  margin: { type: null, required: false },
  background: { type: null, required: false },
  radius: { type: null, required: false },
  borderColor: { type: null, required: false },
  borderWidth: { type: null, required: false },
  elevated: { type: Boolean, required: false },
  viewOpacity: { type: Number, required: false },
  clipPath: { type: String, required: false },
  width: { type: null, required: false },
  height: { type: null, required: false },
  minWidth: { type: null, required: false },
  minHeight: { type: null, required: false },
  maxWidth: { type: null, required: false },
  maxHeight: { type: null, required: false },
  align: { type: Object, required: false }
});
const containerStyle = computed(() => ({
  ...props.padding !== void 0 ? paddingStyle(props.padding) : {},
  ...props.margin !== void 0 ? marginStyle(props.margin) : {},
  ...box({
    background: props.background,
    radius: props.radius,
    borderColor: props.borderColor,
    borderWidth: props.borderWidth,
    elevated: props.elevated,
    opacity: props.viewOpacity,
    clipPath: props.clipPath
  }),
  ...size({
    width: props.width,
    height: props.height,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight
  }),
  ...props.align !== void 0 ? alignStyle(props.align) : {}
}));
</script>
