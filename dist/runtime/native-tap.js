import { isAndroid, Utils } from "@nativescript/core";
export function attachNativeClick(view, onClick, options = {}) {
  const listener = new android.view.View.OnClickListener({ onClick: () => onClick() });
  const apply = () => {
    const nativeView = view.nativeViewProtected;
    if (!nativeView) return;
    nativeView.setOnClickListener(listener);
    if (options.rippleColor !== false) nativeView.setForeground(ripple(view, options));
  };
  const onLoaded = (_args) => apply();
  view.on("loaded", onLoaded);
  if (view.isLoaded) apply();
  return () => {
    view.off("loaded", onLoaded);
    const nativeView = view.nativeViewProtected;
    nativeView?.setOnClickListener(null);
    if (options.rippleColor !== false) nativeView?.setForeground(null);
  };
}
function ripple(view, { rippleColor = 520093696, cornerRadius }) {
  const radius = cornerRadius ?? lengthInDips(view.style.borderTopLeftRadius);
  const mask = new android.graphics.drawable.GradientDrawable();
  mask.setColor(4294967295 | 0);
  mask.setCornerRadius(Utils.layout.toDevicePixels(radius));
  return new android.graphics.drawable.RippleDrawable(
    android.content.res.ColorStateList.valueOf(rippleColor | 0),
    null,
    mask
  );
}
function lengthInDips(length) {
  if (typeof length === "number") return length;
  if (length && typeof length === "object" && "value" in length) {
    const { value, unit } = length;
    return unit === "px" ? Utils.layout.toDeviceIndependentPixels(value) : value;
  }
  return 0;
}
const states = /* @__PURE__ */ new WeakMap();
export const vTap = {
  mounted(el, binding) {
    const view = el.nativeView;
    const state = { handler: binding.value, detach: () => {
    } };
    const fire = () => state.handler?.();
    if (isAndroid) {
      state.detach = attachNativeClick(view, fire, binding.modifiers.noripple ? { rippleColor: false } : {});
    } else {
      view.on("tap", fire);
      state.detach = () => view.off("tap", fire);
    }
    states.set(el, state);
  },
  updated(el, binding) {
    const state = states.get(el);
    if (state) state.handler = binding.value;
  },
  beforeUnmount(el) {
    states.get(el)?.detach();
    states.delete(el);
  }
};
