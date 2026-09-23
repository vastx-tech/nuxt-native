import { colors, fontSizes, radii, spacing, type Spacing } from './theme'

/**
 * Typed style objects instead of CSS classes — Flutter's actual mechanism
 * (widgets take typed style objects, not a CSS engine), which NativeScript
 * already supports directly: every N* component's `:style` binding is
 * already a plain JS object, not a CSS string (confirmed by reading every
 * one of them before writing this). No CSS generation, no CSS parsing, so
 * nothing here can hit the "utility isn't on NativeScript's supported-
 * property list, so it silently no-ops" class of bug Tailwind support has
 * to guard against with its corePlugins allowlist — every property this
 * writes is one confirmed real on NativeScript's View/Style classes.
 *
 * Every function returns a plain style-object fragment, meant to be
 * combined via Vue's own, real, built-in support for binding `:style` to
 * an *array* of objects (merged left to right, confirmed directly by
 * reading nativescript-vue's own renderer/modules/style.js) — no custom
 * merge helper needed:
 *
 *   <NFlex :style="[padding('lg'), bg('surface'), box({ radius: 'md' })]">
 *
 * All exported here are auto-imported (see cli/lib/auto-imports.mjs) —
 * no explicit import needed in a page/component, same as any composable.
 */

export type StyleObject = Record<string, string | number>
type ColorInput = keyof typeof colors | (string & {})

// 1rem = 16 device-independent pixels: NativeScript has no root-font-size/
// rem concept of its own (confirmed: nothing in @nativescript/core's CSS
// engine or style-properties resolves a "rem" unit) — this is a
// deliberate convention borrowed from CSS's own long-standing default,
// not a native NativeScript feature, so it's called out explicitly here
// rather than implied.
const REM_TO_DIP = 16

/**
 * A length: a named spacing token (`'md'`), a raw number (device-
 * independent pixels — NativeScript's own native numeric style values are
 * already just DIPs, confirmed via theme.ts's own spacing scale being
 * plain numbers), or a `px`/`rem` string for readability when a design
 * hands you exact values outside the token scale.
 */
export type Length = Spacing | number | `${number}px` | `${number}rem`

function resolveLength(value: Length): number {
  if (typeof value === 'number') return value
  if (value in spacing) return spacing[value as Spacing]
  const remMatch = /^(-?\d+(?:\.\d+)?)rem$/.exec(value)
  if (remMatch) return Number(remMatch[1]) * REM_TO_DIP
  const pxMatch = /^(-?\d+(?:\.\d+)?)px$/.exec(value)
  if (pxMatch) return Number(pxMatch[1])
  throw new Error(`[nuxt-native] Invalid length: "${value}" — expected a spacing token, a number, or a "Npx"/"Nrem" string.`)
}

function resolveColor(input: ColorInput): string {
  return input in colors ? colors[input as keyof typeof colors] : input
}

function hexToRgb(color: string): [number, number, number] {
  const hex = color.replace('#', '')
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
  const num = Number.parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/**
 * A translucent version of a color — Flutter's `Color.withOpacity()`.
 * `amount` is 0–1. Only works from a hex input (a token, or a raw `#rrggbb`
 * string); an already-translucent `rgba(...)` input isn't re-parsed.
 */
export function opacity(color: ColorInput, amount: number): string {
  const [r, g, b] = hexToRgb(resolveColor(color))
  return `rgba(${r}, ${g}, ${b}, ${amount})`
}

/** A darker version of a color, blended toward black — Flutter's `Color.shade*`. `amount` is 0–1. */
export function shade(color: ColorInput, amount: number): string {
  const [r, g, b] = hexToRgb(resolveColor(color))
  const factor = 1 - amount
  return rgbToHex(r * factor, g * factor, b * factor)
}

/** A lighter version of a color, blended toward white. `amount` is 0–1. */
export function tint(color: ColorInput, amount: number): string {
  const [r, g, b] = hexToRgb(resolveColor(color))
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(v => clamp255(v).toString(16).padStart(2, '0')).join('')}`
}

export interface SpacingSides {
  all?: Length
  horizontal?: Length
  vertical?: Length
  top?: Length
  right?: Length
  bottom?: Length
  left?: Length
}

function resolveSides(input: Length | SpacingSides, prefix: 'padding' | 'margin'): StyleObject {
  const sides: SpacingSides = typeof input === 'object' ? input : { all: input }
  const top = sides.top ?? sides.vertical ?? sides.all
  const bottom = sides.bottom ?? sides.vertical ?? sides.all
  const left = sides.left ?? sides.horizontal ?? sides.all
  const right = sides.right ?? sides.horizontal ?? sides.all

  const style: StyleObject = {}
  if (top !== undefined) style[`${prefix}Top`] = resolveLength(top)
  if (right !== undefined) style[`${prefix}Right`] = resolveLength(right)
  if (bottom !== undefined) style[`${prefix}Bottom`] = resolveLength(bottom)
  if (left !== undefined) style[`${prefix}Left`] = resolveLength(left)
  return style
}

/** `padding('md')`, `padding(16)`, `padding('1rem')`, or `padding({ horizontal: 'lg', top: 8 })`. */
export function padding(input: Length | SpacingSides): StyleObject {
  return resolveSides(input, 'padding')
}

/** Same shape as `padding()`, for margin. */
export function margin(input: Length | SpacingSides): StyleObject {
  return resolveSides(input, 'margin')
}

/** Background color — a theme token name (`'primary'`, `'surface'`, ...) or a raw color string. */
export function bg(color: ColorInput): StyleObject {
  return { backgroundColor: resolveColor(color) }
}

export interface TextStyleInput {
  size?: keyof typeof fontSizes | Length
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: ColorInput
  align?: 'left' | 'center' | 'right'
  /** Real, confirmed NativeScript TextDecoration values (text-base-common.js). */
  decoration?: 'none' | 'underline' | 'line-through' | 'underline line-through'
  /** Real, confirmed NativeScript TextTransform values. */
  transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase'
  letterSpacing?: number
  lineHeight?: Length
}

const fontWeights = { normal: '400', medium: '500', semibold: '600', bold: '700' } as const

/** Text styling — mirrors NText's own variant logic, as a composable fragment instead of a component prop. */
export function textStyle(input: TextStyleInput): StyleObject {
  const style: StyleObject = {}
  if (input.size !== undefined) {
    style.fontSize = typeof input.size === 'string' && input.size in fontSizes
      ? fontSizes[input.size as keyof typeof fontSizes]
      : resolveLength(input.size as Length)
  }
  if (input.weight !== undefined) style.fontWeight = fontWeights[input.weight]
  if (input.color !== undefined) style.color = resolveColor(input.color)
  if (input.align !== undefined) style.textAlignment = input.align
  if (input.decoration !== undefined) style.textDecoration = input.decoration
  if (input.transform !== undefined) style.textTransform = input.transform
  if (input.letterSpacing !== undefined) style.letterSpacing = input.letterSpacing
  if (input.lineHeight !== undefined) style.lineHeight = resolveLength(input.lineHeight)
  return style
}

export interface BoxStyleInput {
  radius?: keyof typeof radii | Length
  background?: ColorInput
  elevated?: boolean
  borderColor?: ColorInput
  borderWidth?: Length
}

/** Card/container styling — radius, background, elevation, border — the same shape NCard builds internally. */
export function box(input: BoxStyleInput = {}): StyleObject {
  const style: StyleObject = {}
  if (input.radius !== undefined) {
    style.borderRadius = typeof input.radius === 'string' && input.radius in radii
      ? radii[input.radius as keyof typeof radii]
      : resolveLength(input.radius as Length)
  }
  if (input.background !== undefined) style.backgroundColor = resolveColor(input.background)
  // Same real box-shadow CSS string NCard uses — see its own comment on
  // why this is left as one fixed elevation rather than a numeric scale.
  if (input.elevated) style.boxShadow = '0 1 3 rgba(15, 23, 42, 0.12)'
  if (input.borderWidth !== undefined) style.borderWidth = resolveLength(input.borderWidth)
  if (input.borderColor !== undefined) style.borderColor = resolveColor(input.borderColor)
  return style
}

export interface SizeInput {
  width?: Length | '100%' | 'auto'
  height?: Length | '100%' | 'auto'
  minWidth?: Length
  minHeight?: Length
  maxWidth?: Length
  maxHeight?: Length
}

/**
 * Dimensions. `'100%'`/`'auto'` pass through as-is — NativeScript's
 * PercentLength/CoreTypes accept those literally (confirmed against
 * @nativescript/core's own CoreTypes) — everything else resolves through
 * the same token/px/rem rules as padding/margin.
 */
export function size(input: SizeInput): StyleObject {
  const style: StyleObject = {}
  if (input.width !== undefined) style.width = typeof input.width === 'string' && (input.width === '100%' || input.width === 'auto') ? input.width : resolveLength(input.width as Length)
  if (input.height !== undefined) style.height = typeof input.height === 'string' && (input.height === '100%' || input.height === 'auto') ? input.height : resolveLength(input.height as Length)
  if (input.minWidth !== undefined) style.minWidth = resolveLength(input.minWidth)
  if (input.minHeight !== undefined) style.minHeight = resolveLength(input.minHeight)
  if (input.maxWidth !== undefined) style.maxWidth = resolveLength(input.maxWidth)
  if (input.maxHeight !== undefined) style.maxHeight = resolveLength(input.maxHeight)
  return style
}

export interface FlexInput {
  /** Only takes effect on a real flex container (<NFlex>/<FlexboxLayout>) — same as flexbox on the web. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around'
  /** Applied to a flex *item*, not the container — set on the child, not the <NFlex> itself. */
  grow?: number
  shrink?: number
  order?: number
  gap?: Length
}

/** Flexbox container/item properties — the same real, confirmed-supported set NFlex/Tailwind's flex utilities target. */
export function flex(input: FlexInput): StyleObject {
  const style: StyleObject = {}
  if (input.direction !== undefined) style.flexDirection = input.direction
  if (input.wrap !== undefined) style.flexWrap = input.wrap
  if (input.justify !== undefined) style.justifyContent = input.justify
  if (input.align !== undefined) style.alignItems = input.align
  if (input.alignContent !== undefined) style.alignContent = input.alignContent
  if (input.grow !== undefined) style.flexGrow = input.grow
  if (input.shrink !== undefined) style.flexShrink = input.shrink
  if (input.order !== undefined) style.order = input.order
  if (input.gap !== undefined) style.gap = resolveLength(input.gap)
  return style
}

/** `visible('collapse')` fully removes the view from layout; `'hidden'` keeps its space reserved but invisible. */
export function visible(value: 'visible' | 'hidden' | 'collapse'): StyleObject {
  return { visibility: value }
}

export function zIndex(value: number): StyleObject {
  return { zIndex: value }
}
