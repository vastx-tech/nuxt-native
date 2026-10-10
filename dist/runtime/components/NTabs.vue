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

<script setup>
defineProps({
  tabs: { type: Array, required: true }
});
</script>
