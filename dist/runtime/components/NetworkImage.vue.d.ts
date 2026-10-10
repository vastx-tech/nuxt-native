import { type BoxStyleInput, type Length } from '../style.js';
/**
 * A remote image with a real loading spinner and a real `#fallback` slot for
 * load failures — `<Image src="https://...">` alone (NativeScript's own
 * primitive) already loads remote URLs natively, this just wraps it with
 * the loading/error state every network-image widget in Flutter/RN gives
 * you for free.
 *
 * Defaults to `useCache: false` — always re-fetches, since NativeScript's
 * own `Image` already defaults to caching (`useCache: true`) on Android (no
 * equivalent property exists on iOS at all — confirmed by reading
 * index.android.js vs index.ios.js directly, so this toggle is genuinely
 * Android-only; iOS behaves the same either way). Reach for `CachedImage`
 * instead when the same URL is reused and its content doesn't change
 * (avatars, product thumbnails) — this component is for content that can
 * change under a stable URL (e.g. a live status thumbnail).
 */
export interface NetworkImageProps {
    src: string;
    width: Length;
    height: Length;
    radius?: BoxStyleInput['radius'];
    stretch?: 'aspectFit' | 'aspectFill' | 'fill' | 'none';
    useCache?: boolean;
}
declare var __VLS_14: {};
type __VLS_Slots = {} & {
    fallback?: (props: typeof __VLS_14) => any;
};
declare const __VLS_component: import("vue").DefineComponent<NetworkImageProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NetworkImageProps> & Readonly<{}>, {
    stretch: "aspectFit" | "aspectFill" | "fill" | "none";
    radius: Length | "full";
    useCache: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
