import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { Application, Frame, Page, View } from '@nativescript/core'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * Reactive safe-area insets (notches, status bars, home indicators) for a
 * page, re-measured on orientation change. Use this instead of CSS
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
 *    actually processes the queued navigation — which is asynchronous
 *    relative to `nativescript-vue`'s own `Frame` `nodeOps.insert()` call
 *    (`frame.navigate({ create: () => child.nativeView })`) that triggers
 *    it. If this composable's `onMounted` — inside the very page being
 *    navigated to — runs before that queue drains, `Frame.topmost()?.
 *    currentPage` can read `null`/the *previous* page, captured once into
 *    a closure variable and never corrected: every listener and the retry
 *    loop kept reading that same wrong reference forever, matching a flat
 *    zero result regardless of how long the retry window was.
 *
 * Fixed by accepting an optional `Ref` to the exact `Page` this call cares
 * about, resolved fresh on every read instead of cached once — `NPage.vue`
 * passes a template ref on its own `<Page>` element, which Vue populates
 * during that component's own mount/patch phase, strictly before any
 * `onMounted` hook (including this composable's) runs, so it can't race
 * against `Frame`'s separate, asynchronous navigation-queue timing at all.
 * `ViewBase.page` (`ui/core/view-base/index.js`) — a plain getter walking
 * `this.parent.page` up a view's own real parent chain, confirmed real —
 * is the same category of fix, but the explicit page ref is more direct
 * here since `NPage.vue` already owns the exact `<Page>` in question.
 * Called with no argument, this falls back to the original
 * `Frame.topmost()?.currentPage` lookup for any other caller.
 */
const MAX_MEASURE_ATTEMPTS = 15
const MEASURE_RETRY_DELAY_MS = 100

function isZeroInsets(area: SafeAreaInsets): boolean {
  return area.top === 0 && area.bottom === 0 && area.left === 0 && area.right === 0
}

export function useSafeArea(pageRef?: Ref<Page | null | undefined>) {
  const insets = ref<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })
  let fallbackPage: Page | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  function currentPage(): Page | undefined {
    return pageRef ? (pageRef.value ?? undefined) : fallbackPage
  }

  function measure() {
    const area = currentPage()?.getSafeAreaInsets()
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
    if (!pageRef) fallbackPage = Frame.topmost()?.currentPage
    measureWithRetry(MAX_MEASURE_ATTEMPTS)
    Application.on(Application.orientationChangedEvent, measure)
    currentPage()?.on(View.layoutChangedEvent, measure)
    currentPage()?.on(Page.navigatedToEvent, measure)
  })

  onUnmounted(() => {
    if (retryTimer !== undefined) clearTimeout(retryTimer)
    Application.off(Application.orientationChangedEvent, measure)
    currentPage()?.off(View.layoutChangedEvent, measure)
    currentPage()?.off(Page.navigatedToEvent, measure)
  })

  return insets
}
