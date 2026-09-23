<template>
  <NFlex class="flex-row items-center justify-between">
    <NText :text="title" variant="h3" weight="semibold" />
    <NText v-if="subtitle" :text="subtitle" variant="caption" color="#64748b" />
  </NFlex>
</template>

<script setup lang="ts">
export interface SectionHeaderProps {
  title: string
  subtitle?: string
}

defineProps<SectionHeaderProps>()
</script>
