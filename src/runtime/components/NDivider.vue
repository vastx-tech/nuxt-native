<template>
  <StackLayout :style="dividerStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors, spacing, type Spacing } from '../theme'

export interface NDividerProps {
  color?: string
  thickness?: number
  /** Space above/below (horizontal orientation) or left/right (vertical). */
  margin?: Spacing
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<NDividerProps>(), {
  color: colors.border,
  thickness: 1,
  margin: 'md',
  orientation: 'horizontal'
})

const dividerStyle = computed(() => {
  const isHorizontal = props.orientation === 'horizontal'
  return {
    backgroundColor: props.color,
    width: isHorizontal ? '100%' : props.thickness,
    height: isHorizontal ? props.thickness : '100%',
    marginTop: isHorizontal ? spacing[props.margin] : 0,
    marginBottom: isHorizontal ? spacing[props.margin] : 0,
    marginLeft: isHorizontal ? 0 : spacing[props.margin],
    marginRight: isHorizontal ? 0 : spacing[props.margin]
  }
})
</script>
