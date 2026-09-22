<template>
  <StackLayout :style="badgeStyle">
    <Label :text="text" :style="labelStyle" text-wrap="false" />
  </StackLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fontSizes, radii, resolveThemeColor, spacing, type ThemeColor } from '../theme'

export interface NBadgeProps {
  text?: string
  variant?: ThemeColor
}

const props = withDefaults(defineProps<NBadgeProps>(), {
  text: '',
  variant: 'primary'
})

const palette = computed(() => resolveThemeColor(props.variant))

const badgeStyle = computed(() => ({
  backgroundColor: palette.value.background,
  borderRadius: radii.full,
  paddingTop: spacing.xs / 2,
  paddingBottom: spacing.xs / 2,
  paddingLeft: spacing.sm,
  paddingRight: spacing.sm,
  horizontalAlignment: 'left' as const
}))

const labelStyle = computed(() => ({
  color: palette.value.text,
  fontSize: fontSizes.xs,
  fontWeight: '600',
  textAlignment: 'center' as const
}))
</script>
