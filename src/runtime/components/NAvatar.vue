<template>
  <Image v-if="src" :src="src" stretch="aspectFill" :style="imageStyle" />
  <GridLayout v-else rows="auto" columns="auto" :style="fallbackStyle">
    <Label :text="initials" :style="initialsStyle" />
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors } from '../theme'

export interface NAvatarProps {
  src?: string
  name?: string
  size?: number
}

const props = withDefaults(defineProps<NAvatarProps>(), {
  src: undefined,
  name: '',
  size: 48
})

const imageStyle = computed(() => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2
}))

const fallbackStyle = computed(() => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  backgroundColor: colors.secondary,
  horizontalAlignment: 'center' as const,
  verticalAlignment: 'middle' as const
}))

const initialsStyle = computed(() => ({
  color: colors.secondaryText,
  fontSize: props.size * 0.38,
  fontWeight: '600',
  textAlignment: 'center' as const,
  horizontalAlignment: 'center' as const,
  verticalAlignment: 'middle' as const
}))

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})
</script>
