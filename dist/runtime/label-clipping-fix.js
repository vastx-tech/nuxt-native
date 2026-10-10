import { Device, Label } from "@nativescript/core";
export function applyLabelClippingFix() {
  if (Device.os !== "Android") return;
  const originalInitNativeView = Label.prototype.initNativeView;
  Label.prototype.initNativeView = function() {
    originalInitNativeView.call(this);
    this.nativeTextViewProtected?.setIncludeFontPadding(true);
  };
}
