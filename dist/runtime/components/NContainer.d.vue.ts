import { type AlignInput, type BoxStyleInput, type SizeInput, type SpacingSides, type Length } from '../style.js';
/**
 * Flutter's `Container` — a single real child (`ContentView`, confirmed
 * already registered by nativescript-vue itself, no extra registration
 * needed), decorated with the same box/spacing helpers `box()`/`padding()`/
 * `margin()`/`size()` already expose as composable functions. Reach for
 * `NFlex` instead when you need to lay out *multiple* children (this is a
 * decorated box around one child, not a flex container — see the two
 * components' own comments for why they aren't the same thing).
 *
 * `align` positions this container *within its own parent* — real
 * NativeScript `horizontalAlignment`/`verticalAlignment` semantics, same as
 * the `align()` style helper. Unlike Flutter's `Container.alignment`, it
 * does NOT reach into the slotted child and reposition it: NativeScript's
 * `ContentView` lays its single child out using that child's *own*
 * `horizontalAlignment`/`verticalAlignment`, which this wrapper has no way
 * to set from the outside — style the child itself (with `align()`) for
 * that.
 */
export interface NContainerProps {
    padding?: Length | SpacingSides;
    margin?: Length | SpacingSides;
    background?: BoxStyleInput['background'];
    radius?: BoxStyleInput['radius'];
    borderColor?: BoxStyleInput['borderColor'];
    borderWidth?: BoxStyleInput['borderWidth'];
    elevated?: boolean;
    /** The container's own alpha (0-1) — see box()'s own `opacity` for the same distinction from the color opacity()/shade()/tint() functions. */
    viewOpacity?: number;
    clipPath?: BoxStyleInput['clipPath'];
    width?: SizeInput['width'];
    height?: SizeInput['height'];
    minWidth?: SizeInput['minWidth'];
    minHeight?: SizeInput['minHeight'];
    maxWidth?: SizeInput['maxWidth'];
    maxHeight?: SizeInput['maxHeight'];
    /** This container's own position within ITS parent — see the class comment above for why it isn't the slotted child's position. */
    align?: AlignInput;
}
declare var __VLS_6: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_6) => any;
};
declare const __VLS_component: import("vue").DefineComponent<NContainerProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NContainerProps> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
