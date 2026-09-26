import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Frame, View, type Page } from '@nativescript/core'

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
 *
 * Also re-measures on the page's own `layoutChangedEvent` (confirmed real
 * and cross-platform in `view-common.js`, fired from `_setNativeViewFrame`
 * on both platforms — including deliberately on the very first layout even
 * when the frame doesn't change, per that method's own comment). Needed
 * because on iOS, `getSafeAreaInsets()` reads `nativeViewProtected.
 * safeAreaInsets` directly (`ui/core/view/index.ios.js`) — a real UIKit
 * property UIKit only populates after the view controller's own first
 * layout pass. `onMounted` fires when the native view is attached, which
 * can race ahead of that pass, so a `measure()` call made only there can
 * read insets stuck at `{0,0,0,0}` and never correct itself (nothing but
 * `orientationChangedEvent` re-triggered it before, which normal
 * single-orientation use never fires). Confirmed as a real bug on a
 * physical device with no home button: a page's bottom-most element sat
 * flush against the screen edge, inside iOS's own system gesture strip,
 * which can swallow taps that land on it.
 */
export function useSafeArea() {
  const insets = ref<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })
  let page: Page | undefined

  function measure() {
    const area = page?.getSafeAreaInsets()
    if (area) {
      insets.value = { top: area.top, bottom: area.bottom, left: area.left, right: area.right }
    }
  }

  onMounted(() => {
    page = Frame.topmost()?.currentPage
    measure()
    Application.on(Application.orientationChangedEvent, measure)
    page?.on(View.layoutChangedEvent, measure)
  })

  onUnmounted(() => {
    Application.off(Application.orientationChangedEvent, measure)
    page?.off(View.layoutChangedEvent, measure)
  })

  return insets
}
