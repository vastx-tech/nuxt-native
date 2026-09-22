<template>
  <Label :text="text" :style="labelStyle" :text-wrap="wrap" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors, fontSizes } from '../theme'

export interface NTextProps {
  text?: string
  /** Typography scale — not raw font sizes, so a theme-wide type change is one edit. */
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'
  color?: string
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  wrap?: boolean
}

const props = withDefaults(defineProps<NTextProps>(), {
  text: '',
  variant: 'body',
  color: undefined,
  weight: undefined,
  align: 'left',
  wrap: true
})

const variantMetrics = {
  h1: { fontSize: fontSizes['3xl'], fontWeight: '700', color: colors.text },
  h2: { fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.text },
  h3: { fontSize: fontSizes.xl, fontWeight: '600', color: colors.text },
  body: { fontSize: fontSizes.md, fontWeight: '400', color: colors.text },
  caption: { fontSize: fontSizes.sm, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text }
} as const

const weightMap = { normal: '400', medium: '500', semibold: '600', bold: '700' } as const

const labelStyle = computed(() => {
  const metrics = variantMetrics[props.variant]
  return {
    fontSize: metrics.fontSize,
    fontWeight: props.weight ? weightMap[props.weight] : metrics.fontWeight,
    color: props.color ?? metrics.color,
    textAlignment: props.align
  }
})
</script>
