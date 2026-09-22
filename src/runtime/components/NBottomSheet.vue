<!--
  Internal wrapper `useBottomSheet()` shows via $showModal — not meant to
  be used directly in a page template. There's no NativeScript bottom-sheet
  primitive to wrap (unlike NButton/NInput/etc., which wrap real widgets);
  this achieves the look through plain layout instead: a full-screen
  transparent backdrop (tapping it dismisses) with the actual sheet content
  anchored to the bottom. Gestures don't bubble between sibling views in
  NativeScript, so a tap landing on the sheet card itself won't also fire
  the backdrop's dismiss handler.
-->
<template>
  <GridLayout rows="*" columns="*" style="width: 100%; height: 100%; backgroundColor: rgba(15, 23, 42, 0.5);" @tap="dismiss">
    <StackLayout vertical-alignment="bottom" :style="sheetStyle" @tap="() => {}">
      <component :is="content" v-bind="contentProps" />
    </StackLayout>
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { $closeModal } from 'nativescript-vue'
import { colors, radii, spacing } from '../theme'

defineProps<{
  content: unknown
  contentProps?: Record<string, unknown>
}>()

const sheetStyle = computed(() => ({
  backgroundColor: colors.surface,
  borderTopLeftRadius: radii.lg,
  borderTopRightRadius: radii.lg,
  padding: spacing.lg
}))

function dismiss() {
  $closeModal(undefined)
}
</script>
