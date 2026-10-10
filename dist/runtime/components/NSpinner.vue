<template>
  <ActivityIndicator busy="true" :color="color" :width="sizePx" :height="sizePx" />
</template>

<script setup>
import { computed } from "vue";
import { colors } from "../theme";
const props = defineProps({
  size: { type: String, required: false, default: "md" },
  color: { type: String, required: false, default: colors.primary }
});
const sizeMap = { sm: 16, md: 24, lg: 36 };
const sizePx = computed(() => sizeMap[props.size]);
</script>
