import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Frame } from '@nativescript/core'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * Reactive safe-area insets (notches, status bars, home indicators) for the
 * current page, re-measured on orientation change. Use this instead of CSS
 * `env(safe-area-inset-*)` — there is no browser engine here to resolve it.
 */
export function useSafeArea() {
  const insets = ref<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })

  function measure() {
    const page = Frame.topmost()?.currentPage
    const area = page?.getSafeAreaInsets()
    if (area) {
      insets.value = { top: area.top, bottom: area.bottom, left: area.left, right: area.right }
    }
  }

  onMounted(() => {
    measure()
    Application.on(Application.orientationChangedEvent, measure)
  })

  onUnmounted(() => {
    Application.off(Application.orientationChangedEvent, measure)
  })

  return insets
}
