import { ref, onMounted, onUnmounted } from "vue";
import { Application, Device, Frame, Page, Utils, View } from "@nativescript/core";
const MAX_MEASURE_ATTEMPTS = 15;
const MEASURE_RETRY_DELAY_MS = 100;
const ANDROID_ROOT_INSETS_MIN_SDK = 23;
const ANDROID_INSETS_TYPE_MIN_SDK = 30;
function isZeroInsets(area) {
  return area.top === 0 && area.bottom === 0 && area.left === 0 && area.right === 0;
}
function getAndroidSystemBarInsets(page) {
  if (android.os.Build.VERSION.SDK_INT < ANDROID_ROOT_INSETS_MIN_SDK) return void 0;
  const nativeView = page.android;
  const rootInsets = nativeView?.getRootWindowInsets();
  if (!rootInsets) return void 0;
  if (android.os.Build.VERSION.SDK_INT >= ANDROID_INSETS_TYPE_MIN_SDK) {
    const bars = rootInsets.getInsets(android.view.WindowInsets.Type.systemBars());
    return { top: bars.top, bottom: bars.bottom, left: bars.left, right: bars.right };
  }
  return {
    top: rootInsets.getSystemWindowInsetTop(),
    bottom: rootInsets.getSystemWindowInsetBottom(),
    left: rootInsets.getSystemWindowInsetLeft(),
    right: rootInsets.getSystemWindowInsetRight()
  };
}
export function useSafeArea() {
  const insets = ref({ top: 0, bottom: 0, left: 0, right: 0 });
  let attachedPage;
  let retryTimer;
  function attachListeners(page) {
    if (attachedPage === page) return;
    detachListeners();
    page.on(View.layoutChangedEvent, measure);
    page.on(Page.navigatedToEvent, measure);
    attachedPage = page;
  }
  function detachListeners() {
    attachedPage?.off(View.layoutChangedEvent, measure);
    attachedPage?.off(Page.navigatedToEvent, measure);
    attachedPage = void 0;
  }
  function measure() {
    const page = Frame.topmost()?.currentPage;
    if (page) attachListeners(page);
    const area = page && Device.os === "Android" ? getAndroidSystemBarInsets(page) : page?.getSafeAreaInsets();
    if (area) {
      insets.value = {
        top: Utils.layout.toDeviceIndependentPixels(area.top),
        bottom: Utils.layout.toDeviceIndependentPixels(area.bottom),
        left: Utils.layout.toDeviceIndependentPixels(area.left),
        right: Utils.layout.toDeviceIndependentPixels(area.right)
      };
    }
  }
  function measureWithRetry(attemptsLeft) {
    measure();
    if (attemptsLeft > 0 && isZeroInsets(insets.value)) {
      retryTimer = setTimeout(() => measureWithRetry(attemptsLeft - 1), MEASURE_RETRY_DELAY_MS);
    }
  }
  onMounted(() => {
    measureWithRetry(MAX_MEASURE_ATTEMPTS);
    Application.on(Application.orientationChangedEvent, measure);
  });
  onUnmounted(() => {
    if (retryTimer !== void 0) clearTimeout(retryTimer);
    Application.off(Application.orientationChangedEvent, measure);
    detachListeners();
  });
  return insets;
}
