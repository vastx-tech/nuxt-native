<template>
  <GridLayout rows="*" columns="*" :style="frameStyle">
    <Image
      :src="src"
      :stretch="stretch"
      load-mode="async"
      use-cache="true"
      :style="imageStyle"
      @is-loading-change="onIsLoadingChange"
    />
    <slot v-if="failed" name="fallback" />
    <NSpinner v-if="loading" size="md" :style="spinnerStyle" />
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { box, size, type BoxStyleInput, type Length } from '../style'
import { useRemoteImageState } from '../composables/useRemoteImageState'

/**
 * `NetworkImage` with caching forced on — for a URL whose content is
 * expected to stay the same across loads (avatars, product thumbnails,
 * banners), so repeat visits don't re-fetch it.
 *
 * `useCache` is confirmed genuinely Android-only (a plain instance
 * property `Image` sets in its own Android-specific `_createImageSourceFromSrc`
 * override, passed straight into the native `ImageView.setUri(...)` call —
 * no equivalent exists in index.ios.js at all): this component is honest
 * about that rather than pretending a disk cache exists on both platforms.
 * On iOS it behaves the same as `NetworkImage`.
 */
export interface CachedImageProps {
  src: string
  width: Length
  height: Length
  radius?: BoxStyleInput['radius']
  stretch?: 'aspectFit' | 'aspectFill' | 'fill' | 'none'
}

const props = withDefaults(defineProps<CachedImageProps>(), {
  radius: undefined,
  stretch: 'aspectFill'
})

const { loading, failed, onIsLoadingChange } = useRemoteImageState()

const frameStyle = computed(() => ({
  ...size({ width: props.width, height: props.height }),
  ...box({ radius: props.radius, clipPath: 'inset(0)' })
}))

const imageStyle = computed(() => size({ width: props.width, height: props.height }))

const spinnerStyle = { horizontalAlignment: 'center' as const, verticalAlignment: 'middle' as const }
</script>
