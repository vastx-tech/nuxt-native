<template>
  <GridLayout rows="*" columns="*" :style="frameStyle">
    <Image
      :src="src"
      :stretch="stretch"
      load-mode="async"
      :use-cache="useCache"
      :decode-width="decodeWidth"
      :decode-height="decodeHeight"
      :style="imageStyle"
      @is-loading-change="onIsLoadingChange"
    />
    <slot v-if="failed" name="fallback" />
    <NSpinner v-if="loading" size="md" :style="spinnerStyle" />
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { box, resolveLength, size, type BoxStyleInput, type Length } from '../style'
import { useRemoteImageState } from '../composables/useRemoteImageState'

/**
 * A remote image with a real loading spinner and a real `#fallback` slot for
 * load failures — `<Image src="https://...">` alone (NativeScript's own
 * primitive) already loads remote URLs natively, this just wraps it with
 * the loading/error state every network-image widget in Flutter/RN gives
 * you for free.
 *
 * Defaults to `useCache: false` — always re-fetches, since NativeScript's
 * own `Image` already defaults to caching (`useCache: true`) on Android (no
 * equivalent property exists on iOS at all — confirmed by reading
 * index.android.js vs index.ios.js directly, so this toggle is genuinely
 * Android-only; iOS behaves the same either way). Reach for `CachedImage`
 * instead when the same URL is reused and its content doesn't change
 * (avatars, product thumbnails) — this component is for content that can
 * change under a stable URL (e.g. a live status thumbnail).
 */
export interface NetworkImageProps {
  src: string
  width: Length
  height: Length
  radius?: BoxStyleInput['radius']
  stretch?: 'aspectFit' | 'aspectFill' | 'fill' | 'none'
  useCache?: boolean
}

const props = withDefaults(defineProps<NetworkImageProps>(), {
  radius: undefined,
  stretch: 'aspectFill',
  useCache: false
})

const { loading, failed, onIsLoadingChange } = useRemoteImageState()

const frameStyle = computed(() => ({
  ...size({ width: props.width, height: props.height }),
  ...box({ radius: props.radius, clipPath: 'inset(0)' })
}))

const imageStyle = computed(() => size({ width: props.width, height: props.height }))

// Caps decode resolution to the size this actually renders at instead of
// the source's full resolution — real properties confirmed on ImageBase
// (decodeWidthProperty/decodeHeightProperty), read by both platforms'
// _createImageSourceFromSrc before the bitmap is even allocated. A 4000px
// source shown at 120dip would otherwise fully decode into memory at its
// native size on every load.
const decodeWidth = computed(() => resolveLength(props.width))
const decodeHeight = computed(() => resolveLength(props.height))

const spinnerStyle = { horizontalAlignment: 'center' as const, verticalAlignment: 'middle' as const }
</script>
