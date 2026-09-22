<template>
  <ActivityIndicator busy="true" :color="color" :width="sizePx" :height="sizePx" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors } from '../theme'

export interface NSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const props = withDefaults(defineProps<NSpinnerProps>(), {
  size: 'md',
  color: colors.primary
})

const sizeMap = { sm: 16, md: 24, lg: 36 } as const
const sizePx = computed(() => sizeMap[props.size])
</script>
