import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Frame, Page, View } from '@nativescript/core'

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
 * populated after the view controller's own first layout pass. Three
 * rounds of real-device testing were needed to pin down just how loosely
 * that pass is coupled to anything this composable could originally
 * observe:
 *
 * 1. Measuring once in `onMounted` alone left insets stuck at `{0,0,0,0}`
 *    whenever the native view attached before that first layout — nothing
 *    but `orientationChangedEvent` (which ordinary single-orientation use
 *    never fires) ever re-triggered a re-measure.
 * 2. Adding `View`'s `layoutChangedEvent` (fired from `_setNativeViewFrame`
 *    on a real frame change) fixed it *once*, then the exact same bug
 *    reproduced on a fresh rebuild. Root cause, confirmed by reading
 *    `viewSafeAreaInsetsDidChange` directly (`ui/page/index.ios.js`): it's
 *    a genuinely separate UIKit callback from whatever sets a view's
 *    frame, and the page's own outer frame is frequently already correct
 *    on the very first layout pass, before insets ever populate — so
 *    `layoutChangedEvent`'s one guaranteed first-layout fire isn't a
 *    reliable signal that insets are actually ready yet.
 * 3. A short bounded retry (5 attempts, 32ms apart) as a backstop *also*
 *    reproduced the bug on a fresh `--clean` rebuild specifically (not a
 *    warm relaunch). Confirmed why by reading `viewSafeAreaInsetsDidChange`
 *    fully: it no-ops entirely (`if (this.isRunningLayout ||
 *    !this.didFirstLayout) return`) if insets change before the page's
 *    first layout completes — very plausible on a cold process start,
 *    whose launch-transition latency is real and variable, unlike a warm
 *    relaunch. 160ms total wasn't a wide enough window for that case.
 *
 * Fixed by adding `Page`'s own `navigatedToEvent` (confirmed real,
 * `ui/page/page-common.js` — notified once the page's navigation
 * transition genuinely completes, a much later and stronger guarantee
 * than any layout-pass event) as a third trigger, and widening the retry
 * window substantially (15 attempts, 100ms apart — up to 1.5s total) to
 * give a slow cold start real room, while devices that resolve
 * immediately still exit the retry loop on their very first check.
 * `layoutChangedEvent`/`orientationChangedEvent` both stay wired too —
 * this only ever adds signals, never removes one that might still matter
 * in some case not yet observed. A device with genuinely all-zero insets
 * (an older iPhone with a home button, or Android) exhausts the retry
 * harmlessly rather than looping forever.
 */
const MAX_MEASURE_ATTEMPTS = 15
const MEASURE_RETRY_DELAY_MS = 100

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
    page?.on(Page.navigatedToEvent, measure)
  })

  onUnmounted(() => {
    if (retryTimer !== undefined) clearTimeout(retryTimer)
    Application.off(Application.orientationChangedEvent, measure)
    page?.off(View.layoutChangedEvent, measure)
    page?.off(Page.navigatedToEvent, measure)
  })

  return insets
}
