<template>
  <ActionBar :title="title">
    <slot />
  </ActionBar>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
