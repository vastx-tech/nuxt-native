<template>
  <StackLayout :style="baseStyle">
    <StackLayout ref="bandRef" :style="bandStyle" />
  </StackLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import type { View } from '@nativescript/core'
import type { AnimationPromise } from '@nativescript/core/ui/animation/animation-shared'
import { colors } from '../theme'
import type { radii } from '../theme'
import { box, opacity, resolveColor, resolveLength, size, tint, type ColorInput, type Length } from '../style'

/**
 * A loading placeholder with a real animated shimmer sweep — not a CSS
 * `@keyframes` animation (that needs a real, referenceable global CSS rule;
 * an inline `:style` fragment has nowhere to hang an `animation-name` on),
 * but NativeScript's own imperative `View.animate()` API, which is exactly
 * as real: `iterations: Number.POSITIVE_INFINITY` is confirmed genuine,
 * documented infinite-loop support (both index.android.js and index.ios.js
 * special-case it directly), and the animation's own returned promise
 * carries a real, confirmed `.cancel()` (animation-common.js's own
 * `promise.cancel = () => this.cancel()`) — used here to stop the sweep on
 * unmount rather than leaking a forever-running animation.
 *
 * The sweep is a translated gradient band clipped to the placeholder's own
 * bounds via `clip-path: inset(0)` — confirmed the only real clipping
 * primitive NativeScript has (no `overflow` property exists at all, same
 * reasoning `box()`'s own `clipPath` doc gives).
 */
export interface NSkeletonProps {
  width: Length
  height: Length
  radius?: keyof typeof radii | Length
  color?: ColorInput
  highlightColor?: ColorInput
  /** One full sweep, in ms. */
  duration?: number
}

const props = withDefaults(defineProps<NSkeletonProps>(), {
  radius: 'sm',
  color: colors.disabled,
  highlightColor: undefined,
  duration: 1200
})

const bandRef = ref<View | null>(null)
let animation: AnimationPromise | undefined

const widthDip = computed(() => resolveLength(props.width))
const bandWidthDip = computed(() => Math.max(widthDip.value * 0.5, 24))

const baseStyle = computed(() => ({
  ...size({ width: props.width, height: props.height }),
  ...box({ background: resolveColor(props.color), radius: props.radius, clipPath: 'inset(0)' })
}))

const bandStyle = computed(() => {
  // Near-white version of the base fill by default — real hex/rgb math via
  // this file's own tint()/opacity(), not hand-rolled here.
  const highlight = props.highlightColor ?? tint(props.color, 0.9)
  return {
    width: bandWidthDip.value,
    height: '100%' as const,
    translateX: -bandWidthDip.value,
    backgroundImage: `linear-gradient(to right, ${opacity(highlight, 0)}, ${opacity(highlight, 0.55)}, ${opacity(highlight, 0)})`
  }
})

onMounted(() => {
  const band = bandRef.value
  if (!band) return
  animation = band.animate({
    translate: { x: widthDip.value + bandWidthDip.value, y: 0 },
    duration: props.duration,
    iterations: Number.POSITIVE_INFINITY,
    curve: 'linear'
  })
  // An infinite-iteration animation's promise never resolves on its own —
  // this is expected, not a leak, as long as cancel() runs on unmount.
  animation.catch(() => {})
})

onUnmounted(() => {
  animation?.cancel()
})
</script>
