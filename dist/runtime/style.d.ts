import { colors, fontSizes, radii, type Spacing } from './theme.js';
/**
 * Typed style objects instead of CSS classes — Flutter's actual mechanism
 * (widgets take typed style objects, not a CSS engine), which NativeScript
 * already supports directly: every N* component's `:style` binding is
 * already a plain JS object, not a CSS string (confirmed by reading every
 * one of them before writing this).
 *
 * Every property this file touches was confirmed real by grepping every
 * `cssName:` registration across `@nativescript/core/ui/` directly (not
 * assumed from documentation, which can drift from what the code actually
 * does — the same discipline this framework's Tailwind support audit
 * used), then reading each property's own real `valueConverter`/enum
 * definition for its exact valid values rather than guessing them. A few
 * properties (`direction`, `background-position`/`background-size`,
 * `text-stroke`) don't have a clean enum in the source and are typed as
 * plain strings — noted individually below.
 *
 * Every function returns a plain style-object fragment, meant to be
 * combined via Vue's own, real, built-in support for binding `:style` to
 * an *array* of objects (merged left to right, confirmed directly by
 * reading nativescript-vue's own renderer/modules/style.js) — no custom
 * merge helper needed:
 *
 *   <NFlex :style="[padding('lg'), bg('surface'), border({ radius: 'md' })]">
 *
 * All exported here are auto-imported (see cli/lib/auto-imports.mjs) —
 * no explicit import needed in a page/component, same as any composable.
 */
export type StyleObject = Record<string, string | number | boolean>;
export type ColorInput = keyof typeof colors | (string & {});
/**
 * A length: a named spacing token (`'md'`), a raw number (device-
 * independent pixels — NativeScript's own native numeric style values are
 * already just DIPs, confirmed via theme.ts's own spacing scale being
 * plain numbers), or a `px`/`rem` string for readability when a design
 * hands you exact values outside the token scale.
 */
export type Length = Spacing | number | `${number}px` | `${number}rem`;
/** Exported for components (e.g. NSkeleton) that need a real DIP number to drive imperative native APIs (like View.animate()) rather than a style-object fragment. */
export declare function resolveLength(value: Length): number;
/** Exported for components (e.g. NSkeleton) that need a resolved color string outside a style-object fragment. */
export declare function resolveColor(input: ColorInput): string;
/**
 * A translucent version of a color — Flutter's `Color.withOpacity()`.
 * `amount` is 0–1. Only works from a hex input (a token, or a raw `#rrggbb`
 * string); an already-translucent `rgba(...)` input isn't re-parsed.
 * (Confirmed `rgba(...)` strings are genuinely parsed by NativeScript's
 * own Color class, not just hex — see color-utils.js.)
 */
export declare function opacity(color: ColorInput, amount: number): string;
/** A darker version of a color, blended toward black — Flutter's `Color.shade*`. `amount` is 0–1. */
export declare function shade(color: ColorInput, amount: number): string;
/** A lighter version of a color, blended toward white. `amount` is 0–1. */
export declare function tint(color: ColorInput, amount: number): string;
export interface SpacingSides {
    all?: Length;
    horizontal?: Length;
    vertical?: Length;
    top?: Length;
    right?: Length;
    bottom?: Length;
    left?: Length;
}
/** `padding('md')`, `padding(16)`, `padding('1rem')`, or `padding({ horizontal: 'lg', top: 8 })`. */
export declare function padding(input: Length | SpacingSides): StyleObject;
/** Same shape as `padding()`, for margin. */
export declare function margin(input: Length | SpacingSides): StyleObject;
export interface SizeInput {
    width?: Length | '100%' | 'auto';
    height?: Length | '100%' | 'auto';
    minWidth?: Length;
    minHeight?: Length;
    maxWidth?: Length;
    maxHeight?: Length;
}
/**
 * Dimensions. `'100%'`/`'auto'` pass through as-is — NativeScript's
 * PercentLength/CoreTypes accept those literally (confirmed against
 * @nativescript/core's own CoreTypes) — everything else resolves through
 * the same token/px/rem rules as padding/margin.
 */
export declare function size(input: SizeInput): StyleObject;
export interface BackgroundInput {
    color?: ColorInput;
    /** A real, parsed CSS value — `url(...)`, or `linear-gradient(...)` (confirmed real, linear only — see ARCHITECTURE.md). */
    image?: string;
    /** Confirmed real values (background.ios.js's own switch on this). */
    repeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
    /** Not cleanly enumerated in source — a real CSS background-position value string (e.g. `'center'`, `'50% 50%'`). */
    position?: string;
    /** Not cleanly enumerated in source — a real CSS background-size value string (e.g. `'cover'`, `'contain'`). */
    size?: string;
}
/** `bg('primary')` (just a color) or `bg({ color, image, repeat, position, size })` for the full background shorthand. */
export declare function bg(input: ColorInput | BackgroundInput): StyleObject;
export interface BoxStyleInput {
    radius?: keyof typeof radii | Length;
    background?: ColorInput;
    elevated?: boolean;
    borderColor?: ColorInput;
    borderWidth?: Length;
    /** The view's own alpha (0–1) — distinct from the opacity()/shade()/tint() color functions above. */
    opacity?: number;
    /** A real CSS clip-path shape string (e.g. `'circle(50%)'`) — NativeScript has no `overflow` property at all, only this. */
    clipPath?: string;
}
export declare function box(input?: BoxStyleInput): StyleObject;
export interface BorderSides {
    all?: Length;
    top?: Length;
    right?: Length;
    bottom?: Length;
    left?: Length;
}
export interface BorderColorSides {
    all?: ColorInput;
    top?: ColorInput;
    right?: ColorInput;
    bottom?: ColorInput;
    left?: ColorInput;
}
export interface RadiusCorners {
    all?: keyof typeof radii | Length;
    topLeft?: keyof typeof radii | Length;
    topRight?: keyof typeof radii | Length;
    bottomLeft?: keyof typeof radii | Length;
    bottomRight?: keyof typeof radii | Length;
}
export interface BorderInput {
    width?: Length | BorderSides;
    color?: ColorInput | BorderColorSides;
    radius?: keyof typeof radii | Length | RadiusCorners;
    /** `'round'` (default) or `'squircle'` — confirmed real, CoreTypes.CornerShape's only two values. */
    cornerShape?: 'round' | 'squircle';
}
/**
 * Per-side border width/color and per-corner radius — `box()`'s simple,
 * single-value border/radius covers the common case; reach for this when
 * you need each side/corner to differ.
 */
export declare function border(input: BorderInput): StyleObject;
export interface TextStyleInput {
    size?: keyof typeof fontSizes | Length;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: ColorInput;
    align?: 'left' | 'center' | 'right' | 'justify';
    family?: string;
    style?: 'normal' | 'italic';
    /** Real, confirmed NativeScript TextDecoration values. */
    decoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    /** Real, confirmed NativeScript TextTransform values. */
    transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    letterSpacing?: number;
    lineHeight?: Length;
    /** Real, confirmed NativeScript WhiteSpace values — 'wrap' is an NS-specific addition alongside the standard two. */
    whiteSpace?: 'normal' | 'nowrap' | 'wrap';
    /** Requires whiteSpace: 'nowrap' to have a visible effect (matches real CSS text-overflow semantics). */
    overflow?: 'clip' | 'ellipsis';
    /** NativeScript-specific (not real CSS) — caps the number of lines regardless of whiteSpace/overflow. */
    maxLines?: number;
    /** A real CSS text-shadow string (e.g. `'1 1 2 rgba(0,0,0,0.3)'`). */
    shadow?: string;
    /** Real CSS text-stroke (confirmed via css-stroke.js's own shorthand parser: `"<width> <color>"`). */
    stroke?: {
        width: Length;
        color: ColorInput;
    };
    /**
     * Real, confirmed `font-variation-settings` (variable-font axes, e.g.
     * `'"wght" 600'`) — iOS only (affectsLayout is Apple-only in the
     * source). Left as a raw string: the source's own value has no clean
     * enum, just axis/value pairs.
     */
    variationSettings?: string;
}
/** Text styling — mirrors NText's own variant logic, as a composable fragment instead of a component prop. */
export declare function textStyle(input: TextStyleInput): StyleObject;
export interface FlexInput {
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /** Confirmed real values — NativeScript's flexbox does NOT support 'space-evenly' (only the CSS Flexbox Level 1 subset). */
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
    align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
    /** Confirmed broken on Android: a non-zero row-gap silently drops a <FlexboxLayout>'s last child from the native view tree entirely (a real bug in NativeScript's own compiled org.nativescript.widgets.FlexboxLayout, not this framework's translation of it — the same reason Tailwind's gap-* is disabled framework-wide). Use per-child margin for spacing instead. */
    gap?: Length;
    rowGap?: Length;
    columnGap?: Length;
    /** Flex item properties — set on the child, not the <NFlex> container itself. */
    grow?: number;
    shrink?: number;
    /** Same values as `align`, plus `'auto'` (inherit the container's `align`) — a flex item's own override. */
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    order?: number;
    /** Confirmed real (FlexWrapBefore.parse) — forces the container to wrap onto a new line/column before this item. */
    wrapBefore?: boolean;
}
/** Flexbox container/item properties — the same real, confirmed-supported set NFlex/Tailwind's flex utilities target. */
export declare function flex(input: FlexInput): StyleObject;
export interface TransformInput {
    rotate?: number;
    rotateX?: number;
    rotateY?: number;
    scaleX?: number;
    scaleY?: number;
    translateX?: Length;
    translateY?: Length;
    /** iOS-only (affectsLayout is Apple-only in the source) — a 3D perspective distance in DIPs. */
    perspective?: number;
}
export declare function transform(input: TransformInput): StyleObject;
export interface AlignInput {
    /** Confirmed real values (CoreTypes.HorizontalAlignment) — includes logical 'start'/'end', not just left/right. */
    horizontal?: 'start' | 'left' | 'center' | 'right' | 'end' | 'stretch';
    /** Confirmed real values (CoreTypes.VerticalAlignmentText) — includes text-relative baseline/sup/sub values, not just top/middle/bottom. */
    vertical?: 'top' | 'middle' | 'bottom' | 'stretch' | 'text-top' | 'text-bottom' | 'sup' | 'sub' | 'baseline';
}
export declare function align(input: AlignInput): StyleObject;
/** `visible('collapse')` fully removes the view from layout; `'hidden'` keeps its space reserved but invisible. */
export declare function visible(value: 'visible' | 'hidden' | 'collapse' | 'collapsed'): StyleObject;
export declare function zIndex(value: number): StyleObject;
/** Android-only real Material elevation shadow (android-elevation/android-dynamic-elevation-offset). No iOS equivalent — use box({ elevated: true }) for a cross-platform shadow instead. */
export declare function elevation(value: number, dynamicOffset?: number): StyleObject;
/** iOS-only (affectsLayout is Apple-only in the source) — text/layout direction. */
export declare function direction(value: 'ltr' | 'rtl'): StyleObject;
/**
 * A view's tint color — confirmed real, a genuine inherited `Style`
 * property (tintColorProperty.register(Style) in image-common.js, despite
 * living in that file), not just an Image-only property: real, native use
 * includes NSwitch's on-tint on iOS.
 */
export declare function tintColor(color: ColorInput): StyleObject;
/** Placeholder text color for NInput's underlying TextField/TextView (confirmed: editable-text-base-common.js's own placeholderColorProperty). */
export declare function placeholder(color: ColorInput): StyleObject;
