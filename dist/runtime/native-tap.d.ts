import type { View } from '@nativescript/core';
import type { Directive } from 'vue';
/**
 * Why this exists: NativeScript's @tap on a plain view (a layout, a Label,
 * a card) counts a quick second tap as a double tap on Android and drops
 * it. Core's TapAndDoubleTapGestureListener (ui/gestures/index.android.js)
 * extends SimpleOnGestureListener, so Android's GestureDetector also
 * installs it as its double-tap listener, and a second tap inside the
 * double-tap timeout (~300 ms) never reaches onSingleTapUp — the only
 * place core fires `tap`. Measured on a device: 5 quick double taps
 * counted 5 of 10. A native <Button> uses a click listener instead and
 * counts every tap; this gives any view the same.
 *
 * iOS doesn't need it (UIKit's single-tap recognizer fires every tap), so
 * there the plain `tap` event is used.
 */
export interface NativeClickOptions {
    /** ARGB ripple colour, or false for none. Default: a neutral 12% black. */
    rippleColor?: number | false;
    /** Corner radius for the ripple, in DIPs. Default: the view's own top-left border radius. */
    cornerRadius?: number;
}
/**
 * Android only. Sets a native View.OnClickListener (and a ripple foreground)
 * on the view now and again on every `loaded`, since NativeScript can
 * recreate a view's native counterpart. Returns a function that removes it.
 */
export declare function attachNativeClick(view: View, onClick: () => void, options?: NativeClickOptions): () => void;
type TapHandler = () => void;
/**
 * `v-tap="handler"` — a tap handler that counts every tap, for anything
 * people tap repeatedly that isn't an <NButton>: steppers, list rows,
 * cards. Adds a ripple on Android; `v-tap.noripple` leaves it out.
 * Use it instead of @tap on the same element, not as well as.
 *
 * Registered globally by the generated app entry.
 */
export declare const vTap: Directive<{
    nativeView: View;
}, TapHandler>;
export {};
