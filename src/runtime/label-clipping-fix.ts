import { Device, Label } from '@nativescript/core'

/**
 * Android-only. `@nativescript/core`'s own `Label`/`TextBase` Android
 * implementation (`ui/text-base/index.android.js`) unconditionally calls
 * `nativeTextViewProtected.setIncludeFontPadding(false)` in
 * `initNativeView()` — its own comment there reads "Fix for custom font
 * over-height issue on Android / Disable font padding to prevent extra
 * spacing around text". That trade removes the vertical room Android
 * normally reserves for a font's real ascent/descent, which is exactly
 * the room that keeps tall glyphs, accents, and descenders (g/y/p/j,
 * capital letters, ...) from being clipped — most visible at larger font
 * sizes or bold weights, reported directly against `<Label>` in a real
 * app built on this framework.
 *
 * Not overridable via CSS/style — `setIncludeFontPadding` isn't a `Style`
 * property at all (confirmed: no such registration anywhere in
 * `@nativescript/core`), just imperative Android setup code with no
 * exposed toggle. Patched here at the same `initNativeView()` override
 * point `@nativescript/core` itself uses (`Label`'s own Android
 * `initNativeView` calls nothing else after `super.initNativeView()` that
 * would undo this — confirmed by reading it directly), restoring
 * Android's normal font padding for every `<Label>` app-wide, including
 * `<NButton>`'s internal one, without touching `node_modules`.
 */
export function applyLabelClippingFix(): void {
  if (Device.os !== 'Android') return
  const originalInitNativeView = Label.prototype.initNativeView
  Label.prototype.initNativeView = function (this: InstanceType<typeof Label>) {
    originalInitNativeView.call(this)
    ;(this as unknown as { nativeTextViewProtected?: { setIncludeFontPadding: (v: boolean) => void } }).nativeTextViewProtected?.setIncludeFontPadding(true)
  }
}
