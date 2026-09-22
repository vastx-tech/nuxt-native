<!--
  A tappable styled container, not NativeScript's native <Button> — that
  widget is TextBase-derived and can only ever hold a plain text label, no
  icon/spinner/custom content alongside it (confirmed against its .d.ts:
  it extends TextBase directly, nothing else). Gestures attach to any View
  in NativeScript (confirmed via GesturesObserver's constructor accepting a
  plain `View`), so a styled GridLayout with @tap gives the same tap
  behavior with real layout flexibility — a spinner can replace the label
  while `loading`, for instance.
-->
<template>
  <GridLayout
    rows="auto"
    columns="auto"
    :style="containerStyle"
    :is-enabled="!disabled && !loading"
    @tap="onTap"
  >
    <ActivityIndicator v-if="loading" busy="true" :color="palette.text" width="20" height="20" />
    <Label v-else :text="text" :style="labelStyle" text-wrap="false" />
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors, fontSizes, radii, resolveThemeColor, spacing, type ThemeColor } from '../theme'

export interface NButtonProps {
  text?: string
  variant?: ThemeColor | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<NButtonProps>(), {
  text: '',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{ tap: [] }>()

const sizeMetrics = {
  sm: { paddingV: spacing.xs, paddingH: spacing.md, fontSize: fontSizes.sm },
  md: { paddingV: spacing.sm, paddingH: spacing.lg, fontSize: fontSizes.md },
  lg: { paddingV: spacing.md, paddingH: spacing.xl, fontSize: fontSizes.lg }
} as const

const palette = computed(() => {
  if (props.disabled) return { background: colors.disabled, text: colors.disabledText, border: colors.disabled }
  if (props.variant === 'outline') return { background: 'transparent', text: colors.primary, border: colors.primary }
  if (props.variant === 'ghost') return { background: 'transparent', text: colors.primary, border: 'transparent' }
  const themed = resolveThemeColor(props.variant)
  return { ...themed, border: themed.background }
})

const containerStyle = computed(() => {
  const metrics = sizeMetrics[props.size]
  return {
    backgroundColor: palette.value.background,
    borderColor: palette.value.border,
    borderWidth: props.variant === 'outline' ? 1 : 0,
    borderRadius: radii.md,
    paddingTop: metrics.paddingV,
    paddingBottom: metrics.paddingV,
    paddingLeft: metrics.paddingH,
    paddingRight: metrics.paddingH,
    opacity: props.disabled ? 0.7 : 1,
    horizontalAlignment: 'left'
  }
})

const labelStyle = computed(() => ({
  color: palette.value.text,
  fontSize: sizeMetrics[props.size].fontSize,
  fontWeight: '600',
  textAlignment: 'center'
}))

function onTap() {
  if (props.disabled || props.loading) return
  emit('tap')
}
</script>
