<template>
  <SVGView :src="src" :stretch="stretch" />
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  stretch: { type: String, required: false, default: "aspectFit" }
});
</script>
