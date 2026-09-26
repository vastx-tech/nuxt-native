import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Frame, Page, Utils, View } from '@nativescript/core'

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
 * populated after the view controller's own first layout pass. Four rounds
 * of real-device testing were needed to find the actual cause here — the
 * first three chased a first-layout *timing* race that turned out not to
 * be the real problem:
 *
 * 1. Measuring once in `onMounted` alone left insets stuck at `{0,0,0,0}`.
 * 2. Adding `View`'s `layoutChangedEvent` fixed it once, then reproduced
 *    again on a rebuild (`viewSafeAreaInsetsDidChange` is a genuinely
 *    separate UIKit callback from whatever sets a view's frame).
 * 3. A short bounded retry (5×32ms) *also* reproduced on a fresh `--clean`
 *    rebuild, and adding `Page`'s `navigatedToEvent` plus widening the
 *    retry to 15×100ms (1.5s total) *still* reproduced it — but this time
 *    **flat, permanent zero**, not intermittent, on a device confirmed to
 *    genuinely have non-zero insets (an iPhone XS). A real timing race
 *    would eventually self-correct somewhere in a 1.5s window; a flat
 *    result the whole time doesn't fit that theory at all.
 * 4. Root cause, confirmed by reading `frame-common.js`'s `setCurrent()`
 *    directly: `Frame.currentPage` only flips (and `Page`'s own
 *    `navigatedToEvent` only fires) once `_processNextNavigationEntry()`
 *    actually processes the queued navigation — asynchronous relative to
 *    `nativescript-vue`'s own `Frame` `nodeOps.insert()` call that
 *    triggers it. Caching `Frame.topmost()?.currentPage` once in
 *    `onMounted` (inside the very page being navigated to) could read
 *    `null`/the *previous* page if that queue hadn't drained yet — and
 *    once cached wrong, it stayed wrong: every listener and the retry
 *    loop kept reading the same stale reference forever, matching a flat
 *    zero result regardless of retry-window length.
 *
 *    A follow-up fix (passing an explicit template `Ref` to the exact
 *    `Page`, resolved fresh via the ref instead of a cached variable)
 *    crashed the app on launch with a native `tns::NativeScriptException`
 *    on every page, reproduced independently of any of the retry/test
 *    scaffolding around it — a real regression, reverted. Root cause not
 *    confirmed (no device-side JS stack trace was obtainable to pin it
 *    down further), so that approach — a template `ref` on `<Page>` in
 *    `NPage.vue` — is deliberately not used here until it's understood.
 *
 * Fixed instead by never caching the page at all: `measure()` re-resolves
 * `Frame.topmost()?.currentPage` fresh on every call (including every
 * retry tick), so once the navigation queue actually drains — well within
 * the retry window, per the timing already confirmed sufficient in round
 * 3 — it starts reading the real, current page instead of a stale one.
 * Event listeners follow the same self-healing rule: `measure()` attaches
 * them to whichever page it just resolved, migrating off the previous one
 * first if a different page shows up later (covers real navigation to a
 * new page while this composable's the active one, not just first mount).
 */
const MAX_MEASURE_ATTEMPTS = 15
const MEASURE_RETRY_DELAY_MS = 100

function isZeroInsets(area: SafeAreaInsets): boolean {
  return area.top === 0 && area.bottom === 0 && area.left === 0 && area.right === 0
}

export function useSafeArea() {
  const insets = ref<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })
  let attachedPage: Page | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  function attachListeners(page: Page) {
    if (attachedPage === page) return
    detachListeners()
    page.on(View.layoutChangedEvent, measure)
    page.on(Page.navigatedToEvent, measure)
    attachedPage = page
  }

  function detachListeners() {
    attachedPage?.off(View.layoutChangedEvent, measure)
    attachedPage?.off(Page.navigatedToEvent, measure)
    attachedPage = undefined
  }

  function measure() {
    const page = Frame.topmost()?.currentPage
    if (page) attachListeners(page)
    const area = page?.getSafeAreaInsets()
    if (area) {
      // getSafeAreaInsets() returns device pixels, not DIPs (confirmed:
      // ui/core/view/index.ios.js runs the real UIKit safeAreaInsets
      // through layout.toDevicePixels() before returning it) — but every
      // consumer of this composable (NPage's own padding style) expects
      // plain DIP numbers, the same unit every other numeric style value
      // in this framework already uses. Converting back with the real,
      // confirmed inverse (layout.toDeviceIndependentPixels()) matters
      // most on higher-density screens: an uncorrected 3x device reserved
      // 3x too much edge padding, confirmed on a real iPhone XS (102
      // device px read back as 102 DIP instead of the real 34).
      insets.value = {
        top: Utils.layout.toDeviceIndependentPixels(area.top),
        bottom: Utils.layout.toDeviceIndependentPixels(area.bottom),
        left: Utils.layout.toDeviceIndependentPixels(area.left),
        right: Utils.layout.toDeviceIndependentPixels(area.right)
      }
    }
  }

  function measureWithRetry(attemptsLeft: number) {
    measure()
    if (attemptsLeft > 0 && isZeroInsets(insets.value)) {
      retryTimer = setTimeout(() => measureWithRetry(attemptsLeft - 1), MEASURE_RETRY_DELAY_MS)
    }
  }

  onMounted(() => {
    measureWithRetry(MAX_MEASURE_ATTEMPTS)
    Application.on(Application.orientationChangedEvent, measure)
  })

  onUnmounted(() => {
    if (retryTimer !== undefined) clearTimeout(retryTimer)
    Application.off(Application.orientationChangedEvent, measure)
    detachListeners()
  })

  return insets
}
