<template>
  <GridLayout rows="*" columns="*" :style="frameStyle">
    <Image
      :src="src"
      :stretch="stretch"
      loadMode="async"
      :useCache="useCache"
      :decodeWidth="decodeWidth"
      :decodeHeight="decodeHeight"
      :style="imageStyle"
      @is-loading-change="onIsLoadingChange"
    />
    <slot v-if="failed" name="fallback" />
    <NSpinner v-if="loading" size="md" :style="spinnerStyle" />
  </GridLayout>
</template>

<script setup>
import { computed } from "vue";
import { box, resolveLength, size } from "../style";
import { useRemoteImageState } from "../composables/useRemoteImageState";
const props = defineProps({
  src: { type: String, required: true },
  width: { type: null, required: true },
  height: { type: null, required: true },
  radius: { type: null, required: false, default: void 0 },
  stretch: { type: String, required: false, default: "aspectFill" },
  useCache: { type: Boolean, required: false, default: false }
});
const { loading, failed, onIsLoadingChange } = useRemoteImageState();
const frameStyle = computed(() => ({
  ...size({ width: props.width, height: props.height }),
  ...box({ radius: props.radius, clipPath: "inset(0)" })
}));
const imageStyle = computed(() => size({ width: props.width, height: props.height }));
const decodeWidth = computed(() => resolveLength(props.width));
const decodeHeight = computed(() => resolveLength(props.height));
const spinnerStyle = { horizontalAlignment: "center", verticalAlignment: "middle" };
</script>
