<template>
  <Page :action-bar-hidden="!title && !$slots.actionBar">
    <NActionBar v-if="title || $slots.actionBar" :title="title">
      <slot name="actionBar" />
    </NActionBar>
    <!-- ios-content-inset-adjustment-behavior="automatic": NativeScript's
         own ScrollView defaults this to 'never', which makes it subtract
         getSafeAreaInsets() from its own internal contentSize math itself
         (confirmed directly in @nativescript/core's index.ios.js, which
         even comments on this exact double-counting risk) — stacking with
         the manual safe-area padding useSafeArea()/contentStyle below
         already applies to this page's content. 'automatic' hands inset
         handling to iOS's own native UIScrollView behavior instead, so our
         one manual padding source isn't compounded by a second, internal
         one. A no-op on Android (this property's affectsLayout is
         Apple-only in the source). -->
    <ScrollView v-if="scrollable" orientation="vertical" ios-content-inset-adjustment-behavior="automatic">
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
