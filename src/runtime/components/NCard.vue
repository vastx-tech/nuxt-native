<template>
  <StackLayout :style="cardStyle">
    <slot />
  </StackLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors, radii, spacing, type Spacing } from '../theme'

export interface NCardProps {
  padding?: Spacing
  elevated?: boolean
  background?: string
}

const props = withDefaults(defineProps<NCardProps>(), {
  padding: 'lg',
  elevated: true,
  background: undefined
})

const cardStyle = computed(() => ({
  backgroundColor: props.background ?? colors.surface,
  borderRadius: radii.md,
  padding: spacing[props.padding],
  // boxShadow takes a CSS box-shadow string (confirmed against
  // @nativescript/core's ShadowCSSValues/parseCSSShadow) — support and
  // exact rendering vary by platform, so this is left off entirely
  // rather than shipping a shadow that looks wrong on one of them.
  ...(props.elevated ? { boxShadow: '0 1 3 rgba(15, 23, 42, 0.12)' } : {}),
  borderWidth: props.elevated ? 0 : 1,
  borderColor: colors.border
}))
</script>
