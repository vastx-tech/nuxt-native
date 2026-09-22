/**
 * Design tokens shared by every N* component — a single place to retheme
 * the whole kit, and what lets each component ship sensible defaults
 * instead of asking every consumer to specify colors/spacing/radii by hand.
 * Plain hex/rgba strings throughout: NativeScript's `backgroundColor`,
 * `color`, etc. accept `string | Color` directly, no `new Color(...)`
 * construction needed (confirmed against @nativescript/core's View types).
 */
export const colors = {
  primary: '#4F46E5',
  primaryText: '#FFFFFF',
  secondary: '#64748B',
  secondaryText: '#FFFFFF',
  danger: '#DC2626',
  dangerText: '#FFFFFF',
  success: '#16A34A',
  successText: '#FFFFFF',
  warning: '#D97706',
  warningText: '#FFFFFF',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  disabled: '#CBD5E1',
  disabledText: '#94A3B8'
} as const

export type ThemeColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning'

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32
} as const

export type Spacing = keyof typeof spacing

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999
} as const

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34
} as const

const themeTextColors: Record<ThemeColor, string> = {
  primary: colors.primaryText,
  secondary: colors.secondaryText,
  danger: colors.dangerText,
  success: colors.successText,
  warning: colors.warningText
}

export function resolveThemeColor(color: ThemeColor): { background: string, text: string } {
  return { background: colors[color], text: themeTextColors[color] }
}
