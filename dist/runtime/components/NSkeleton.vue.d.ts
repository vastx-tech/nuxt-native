import type { radii } from '../theme.js';
import { type ColorInput, type Length } from '../style.js';
/**
 * A loading placeholder with a real animated shimmer sweep — not a CSS
 * `@keyframes` animation (that needs a real, referenceable global CSS rule;
 * an inline `:style` fragment has nowhere to hang an `animation-name` on),
 * but NativeScript's own imperative `View.animate()` API, which is exactly
 * as real: `iterations: Number.POSITIVE_INFINITY` is confirmed genuine,
 * documented infinite-loop support (both index.android.js and index.ios.js
 * special-case it directly), and the animation's own returned promise
 * carries a real, confirmed `.cancel()` (animation-common.js's own
 * `promise.cancel = () => this.cancel()`) — used here to stop the sweep on
 * unmount rather than leaking a forever-running animation.
 *
 * The sweep is a translated gradient band clipped to the placeholder's own
 * bounds via `clip-path: inset(0)` — confirmed the only real clipping
 * primitive NativeScript has (no `overflow` property exists at all, same
 * reasoning `box()`'s own `clipPath` doc gives).
 */
export interface NSkeletonProps {
    width: Length;
    height: Length;
    radius?: keyof typeof radii | Length;
    color?: ColorInput;
    highlightColor?: ColorInput;
    /** One full sweep, in ms. */
    duration?: number;
}
declare const _default: import("vue").DefineComponent<NSkeletonProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NSkeletonProps> & Readonly<{}>, {
    color: ColorInput;
    radius: keyof typeof radii | Length;
    highlightColor: ColorInput;
    duration: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
