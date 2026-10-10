<template>
  <ActionBar :title="title">
    <slot />
  </ActionBar>
</template>

<script setup>
defineProps({
  title: { type: String, required: false }
});
</script>
