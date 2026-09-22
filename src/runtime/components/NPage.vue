<template>
  <Page :action-bar-hidden="!title && !$slots.actionBar">
    <NActionBar v-if="title || $slots.actionBar" :title="title">
      <slot name="actionBar" />
    </NActionBar>
    <ScrollView v-if="scrollable" orientation="vertical">
      <GridLayout :style="contentStyle">
        <slot />
      </GridLayout>
    </ScrollView>
    <GridLayout v-else :style="contentStyle">
      <slot />
    </GridLayout>
  </Page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSafeArea } from '../composables/useSafeArea'
import NActionBar from './NActionBar.vue'

withDefaults(defineProps<{ title?: string, scrollable?: boolean }>(), {
  scrollable: true
})

const insets = useSafeArea()
const contentStyle = computed(() => ({
  paddingTop: `${insets.value.top}`,
  paddingBottom: `${insets.value.bottom}`,
  paddingLeft: `${insets.value.left}`,
  paddingRight: `${insets.value.right}`
}))
</script>
