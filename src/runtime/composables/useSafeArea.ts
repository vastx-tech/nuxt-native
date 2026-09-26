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
 * On iOS, `getSafeAreaInsets()` reads `nativeViewProtected.safeAreaInsets`
 * directly (`ui/core/view/index.ios.js`) — a real UIKit property only
 * populated after the view controller's own first layout pass, itself
 * driven by a *separate* UIKit callback (`viewSafeAreaInsetsDidChange`,
 * confirmed real in `ui/page/index.ios.js`) from the one that sets a
 * view's frame. `View`'s own `layoutChangedEvent` (confirmed real and
 * cross-platform, fired from `_setNativeViewFrame`) only fires when a
 * view's *frame* changes — and the page's own outer frame frequently does
 * NOT change when just its safe-area insets are (re)computed, so listening
 * for it alone isn't a reliable enough signal that insets are actually
 * ready by the time `measure()` runs. Confirmed as a real bug on a
 * physical device with no home button, twice: a page's bottom-most element
 * sat flush against the screen edge, inside iOS's own system gesture
 * strip (which can swallow taps landing on it) — first from `onMounted`
 * alone (nothing but `orientationChangedEvent`, which ordinary
 * single-orientation use never fires, ever re-triggered a re-measure),
 * then intermittently even after adding the `layoutChangedEvent` listener
 * (works when its one guaranteed first-layout fire happens to land after
 * insets are populated, not when it races ahead of them).
 *
 * Fixed robustly rather than chasing an exact single "insets are now
 * definitely ready" event: `layoutChangedEvent` stays wired for the
 * ordinary case (and orientation changes), and a short, bounded retry
 * loop backstops the specific first-render race — re-measuring a few
 * times a frame or two apart until a non-zero reading lands, or giving up
 * after `MAX_MEASURE_ATTEMPTS` (a device that genuinely has all-zero
 * insets, e.g. an older iPhone with a home button, or Android, correctly
 * exhausts these harmlessly rather than looping forever).
 */
const MAX_MEASURE_ATTEMPTS = 5
const MEASURE_RETRY_DELAY_MS = 32

function isZeroInsets(area: SafeAreaInsets): boolean {
  return area.top === 0 && area.bottom === 0 && area.left === 0 && area.right === 0
}

export function useSafeArea() {
  const insets = ref<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })
  let page: Page | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  function measure() {
    const area = page?.getSafeAreaInsets()
    if (area) {
      insets.value = { top: area.top, bottom: area.bottom, left: area.left, right: area.right }
    }
  }

  function measureWithRetry(attemptsLeft: number) {
    measure()
    if (attemptsLeft > 0 && isZeroInsets(insets.value)) {
      retryTimer = setTimeout(() => measureWithRetry(attemptsLeft - 1), MEASURE_RETRY_DELAY_MS)
    }
  }

  onMounted(() => {
    page = Frame.topmost()?.currentPage
    measureWithRetry(MAX_MEASURE_ATTEMPTS)
    Application.on(Application.orientationChangedEvent, measure)
    page?.on(View.layoutChangedEvent, measure)
  })

  onUnmounted(() => {
    if (retryTimer !== undefined) clearTimeout(retryTimer)
    Application.off(Application.orientationChangedEvent, measure)
    page?.off(View.layoutChangedEvent, measure)
  })

  return insets
}
