import { type BoxStyleInput, type Length } from '../style.js';
/**
 * `NetworkImage` with caching forced on — for a URL whose content is
 * expected to stay the same across loads (avatars, product thumbnails,
 * banners), so repeat visits don't re-fetch it.
 *
 * `useCache` is confirmed genuinely Android-only (a plain instance
 * property `Image` sets in its own Android-specific `_createImageSourceFromSrc`
 * override, passed straight into the native `ImageView.setUri(...)` call —
 * no equivalent exists in index.ios.js at all): this component is honest
 * about that rather than pretending a disk cache exists on both platforms.
 * On iOS it behaves the same as `NetworkImage`.
 */
export interface CachedImageProps {
    src: string;
    width: Length;
    height: Length;
    radius?: BoxStyleInput['radius'];
    stretch?: 'aspectFit' | 'aspectFill' | 'fill' | 'none';
}
declare var __VLS_14: {};
type __VLS_Slots = {} & {
    fallback?: (props: typeof __VLS_14) => any;
};
declare const __VLS_component: import("vue").DefineComponent<CachedImageProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<CachedImageProps> & Readonly<{}>, {
    stretch: "aspectFit" | "aspectFill" | "fill" | "none";
    radius: Length | "full";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
