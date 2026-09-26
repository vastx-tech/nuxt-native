<template>
  <Page ref="pageRef" :action-bar-hidden="!title && !$slots.actionBar">
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
import { computed, ref, type Ref } from 'vue'
import type { Page } from '@nativescript/core'
import { useSafeArea } from '../composables/useSafeArea'
import NActionBar from './NActionBar.vue'

withDefaults(defineProps<{ title?: string, scrollable?: boolean }>(), {
  scrollable: true
})

// A template ref, not Frame.topmost() — see useSafeArea.ts's own comment
// for why the latter can race against Frame's asynchronous navigation
// queue and read the wrong (or no) page, permanently. Left untyped at the
// template-ref site (vue-tsc infers a structurally different ambient type
// for a native <Page> ref binding than @nativescript/core's own exported
// Page class — the real runtime value is a genuine Page either way,
// confirmed directly elsewhere in this codebase for other native refs) and
// cast only at the one point that needs the real class's methods.
const pageRef = ref()
const insets = useSafeArea(pageRef as Ref<Page | null | undefined>)
const contentStyle = computed(() => ({
  paddingTop: `${insets.value.top}`,
  paddingBottom: `${insets.value.bottom}`,
  paddingLeft: `${insets.value.left}`,
  paddingRight: `${insets.value.right}`
}))
</script>
