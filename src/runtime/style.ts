import { colors, fontSizes, radii, spacing, type Spacing } from './theme'

/**
 * A smaller, testable slice of the "typed style objects instead of CSS
 * classes" idea — Flutter's actual mechanism (widgets take typed style
 * objects, not a CSS engine), which NativeScript already supports
 * directly: every N* component's `:style` binding is already a plain JS
 * object, not a CSS string (confirmed by reading every one of them before
 * writing this). This just gives that existing capability a small,
 * ergonomic, typed API built on the same tokens (`colors`/`spacing`/
 * `radii`/`fontSizes`) the rest of the UI kit already uses — no CSS
 * generation, no CSS parsing, so nothing here can hit the "utility isn't
 * on NativeScript's supported-property list, so it silently no-ops" class
 * of bug Tailwind support has to guard against with its corePlugins
 * allowlist.
 *
 * Each function returns a plain style-object fragment, meant to be
 * combined via Vue's own, real, built-in support for binding `:style` to
 * an *array* of objects (merged left to right) — no custom merge helper
 * needed:
 *
 *   <NFlex :style="[padding('lg'), bg('surface'), box({ radius: 'md' })]">
 */

export type StyleObject = Record<string, string | number>
type ColorInput = keyof typeof colors | (string & {})

function resolveColor(input: ColorInput): string {
  return input in colors ? colors[input as keyof typeof colors] : input
}

export interface SpacingSides {
  all?: Spacing
  horizontal?: Spacing
  vertical?: Spacing
  top?: Spacing
  right?: Spacing
  bottom?: Spacing
  left?: Spacing
}

function resolveSides(input: Spacing | SpacingSides, prefix: 'padding' | 'margin'): StyleObject {
  const sides: SpacingSides = typeof input === 'string' ? { all: input } : input
  const top = sides.top ?? sides.vertical ?? sides.all
  const bottom = sides.bottom ?? sides.vertical ?? sides.all
  const left = sides.left ?? sides.horizontal ?? sides.all
  const right = sides.right ?? sides.horizontal ?? sides.all

  const style: StyleObject = {}
  if (top !== undefined) style[`${prefix}Top`] = spacing[top]
  if (right !== undefined) style[`${prefix}Right`] = spacing[right]
  if (bottom !== undefined) style[`${prefix}Bottom`] = spacing[bottom]
  if (left !== undefined) style[`${prefix}Left`] = spacing[left]
  return style
}

/** `padding('md')` (all sides) or `padding({ horizontal: 'lg', top: 'sm' })`. */
export function padding(input: Spacing | SpacingSides): StyleObject {
  return resolveSides(input, 'padding')
}

/** Same shape as `padding()`, for margin. */
export function margin(input: Spacing | SpacingSides): StyleObject {
  return resolveSides(input, 'margin')
}

/** Background color — a theme token name (`'primary'`, `'surface'`, ...) or a raw color string. */
export function bg(color: ColorInput): StyleObject {
  return { backgroundColor: resolveColor(color) }
}

export interface TextStyleInput {
  size?: keyof typeof fontSizes
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: ColorInput
  align?: 'left' | 'center' | 'right'
}

const fontWeights = { normal: '400', medium: '500', semibold: '600', bold: '700' } as const

/** Text styling — mirrors NText's own variant logic, as a composable fragment instead of a component prop. */
export function textStyle(input: TextStyleInput): StyleObject {
  const style: StyleObject = {}
  if (input.size !== undefined) style.fontSize = fontSizes[input.size]
  if (input.weight !== undefined) style.fontWeight = fontWeights[input.weight]
  if (input.color !== undefined) style.color = resolveColor(input.color)
  if (input.align !== undefined) style.textAlignment = input.align
  return style
}

export interface BoxStyleInput {
  radius?: keyof typeof radii
  background?: ColorInput
  elevated?: boolean
  borderColor?: ColorInput
  borderWidth?: number
}

/** Card/container styling — radius, background, elevation, border — the same shape NCard builds internally. */
export function box(input: BoxStyleInput = {}): StyleObject {
  const style: StyleObject = {}
  if (input.radius !== undefined) style.borderRadius = radii[input.radius]
  if (input.background !== undefined) style.backgroundColor = resolveColor(input.background)
  // Same real box-shadow CSS string NCard uses — see its own comment on
  // why this is left as one fixed elevation rather than a numeric scale.
  if (input.elevated) style.boxShadow = '0 1 3 rgba(15, 23, 42, 0.12)'
  if (input.borderWidth !== undefined) style.borderWidth = input.borderWidth
  if (input.borderColor !== undefined) style.borderColor = resolveColor(input.borderColor)
  return style
}
