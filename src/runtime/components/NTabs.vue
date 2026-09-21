<template>
  <BottomNavigation>
    <TabStrip>
      <TabStripItem v-for="tab in tabs" :key="tab.name">
        <Label :text="tab.title" />
      </TabStripItem>
    </TabStrip>
    <TabContentItem v-for="tab in tabs" :key="tab.name">
      <slot :name="tab.name" />
    </TabContentItem>
  </BottomNavigation>
</template>

<script setup lang="ts">
export interface NTab {
  /** Matches a named slot, <template #[name]>, holding that tab's content. */
  name: string
  title: string
}

defineProps<{ tabs: NTab[] }>()
</script>
