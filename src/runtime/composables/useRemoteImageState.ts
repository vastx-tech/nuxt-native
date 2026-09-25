import { ref } from 'vue'

/**
 * Shared loading/error tracking for NetworkImage/CachedImage — not
 * auto-imported (internal to those two components, not part of the public
 * composable surface).
 *
 * There is no dedicated "load failed" event on NativeScript's `Image`
 * (confirmed: `ImageBase.isLoadingChangeEvent` is the only event it fires —
 * see image-common.js). On a failed load, `_createImageSourceFromSrc`'s own
 * catch path still flips `isLoading` back to `false` without ever setting
 * `imageSource` — so "finished loading, but no imageSource" is the only
 * real signal available, read directly off the property-change event's own
 * `object` (confirmed real: NativeScript's property-change events carry
 * `{ object, value, oldValue }`, not just a bare value).
 */
export function useRemoteImageState() {
  const loading = ref(false)
  const failed = ref(false)

  function onIsLoadingChange(event: { value: boolean; object: { imageSource?: unknown } }) {
    loading.value = event.value
    if (event.value) failed.value = false
    else failed.value = !event.object.imageSource
  }

  return { loading, failed, onIsLoadingChange }
}
