<!--
  A tappable styled container, not NativeScript's native <Button> — that
  widget is TextBase-derived and can only ever hold a plain text label, no
  icon/spinner/custom content alongside it (confirmed against its .d.ts:
  it extends TextBase directly, nothing else). Gestures attach to any View
  in NativeScript (confirmed via GesturesObserver's constructor accepting a
  plain `View`), so a styled GridLayout with @tap gives the same tap
  behavior with real layout flexibility — a spinner can replace the label
  while `loading`, for instance.

  A default slot overrides `text` entirely when provided (checked via
  `$slots.default`, same pattern NPage already uses for `actionBar`) —
  for composing an icon alongside a label, e.g.
  `<NButton><NFlex class="flex-row items-center"><NSvg .../><NText text="..."/></NFlex></NButton>`,
  which plain `text` can't express since it only ever renders one `<Label>`.

  Taps on Android use a native View.OnClickListener, not NativeScript's
  @tap: @tap on a plain view goes through Android's GestureDetector with a
  double-tap listener attached (core's TapAndDoubleTapGestureListener
  extends SimpleOnGestureListener), which treats a second tap inside the
  double-tap window as a double tap and never reports it as a tap — so
  tapping quickly twice only fired once (reported on a device). A native
  <Button> uses a click listener and doesn't have this problem; now
  NButton doesn't either, and gets the platform ripple as well. iOS keeps
  @tap: UIKit's single-tap recognizer fires for every tap.
-->
<template>
  <GridLayout
    rows="auto"
    columns="auto"
    :style="containerStyle"
    :isEnabled="!disabled && !loading"
    accessibilityRole="button"
    v-on="isAndroid ? { loaded: attachNativeClick } : { tap: onTap }"
  >
    <ActivityIndicator v-if="loading" busy="true" :color="palette.text" width="20" height="20" />
    <slot v-else-if="$slots.default" />
    <Label v-else :text="text" :style="labelStyle" textWrap="false" />
  </GridLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isAndroid, Utils } from '@nativescript/core'
import type { EventData, View } from '@nativescript/core'
import { colors, fontSizes, radii, resolveThemeColor, spacing, type ThemeColor } from '../theme'

export interface NButtonProps {
  text?: string
  variant?: ThemeColor | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<NButtonProps>(), {
  text: '',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{ tap: [] }>()

const sizeMetrics = {
  sm: { paddingV: spacing.xs, paddingH: spacing.md, fontSize: fontSizes.sm },
  md: { paddingV: spacing.sm, paddingH: spacing.lg, fontSize: fontSizes.md },
  lg: { paddingV: spacing.md, paddingH: spacing.xl, fontSize: fontSizes.lg }
} as const

const palette = computed(() => {
  if (props.disabled) return { background: colors.disabled, text: colors.disabledText, border: colors.disabled }
  if (props.variant === 'outline') return { background: 'transparent', text: colors.primary, border: colors.primary }
  if (props.variant === 'ghost') return { background: 'transparent', text: colors.primary, border: 'transparent' }
  const themed = resolveThemeColor(props.variant)
  return { ...themed, border: themed.background }
})

const containerStyle = computed(() => {
  const metrics = sizeMetrics[props.size]
  return {
    backgroundColor: palette.value.background,
    borderColor: palette.value.border,
    borderWidth: props.variant === 'outline' ? 1 : 0,
    borderRadius: radii.md,
    paddingTop: metrics.paddingV,
    paddingBottom: metrics.paddingV,
    paddingLeft: metrics.paddingH,
    paddingRight: metrics.paddingH,
    opacity: props.disabled ? 0.7 : 1,
    horizontalAlignment: 'left'
  }
})

const labelStyle = computed(() => ({
  color: palette.value.text,
  fontSize: sizeMetrics[props.size].fontSize,
  fontWeight: '600',
  textAlignment: 'center'
}))

function onTap() {
  if (props.disabled || props.loading) return
  emit('tap')
}

// Held here so the Java proxy isn't garbage collected while the view uses it.
let clickListener: android.view.View.OnClickListener | undefined

/** Android only — see the comment at the top. Runs on every `loaded`, so it survives a native view being recreated. */
function attachNativeClick(args: EventData) {
  const nativeView = (args.object as View).nativeViewProtected as android.view.View | undefined
  if (!nativeView) return
  clickListener ??= new android.view.View.OnClickListener({ onClick: () => onTap() })
  nativeView.setOnClickListener(clickListener)

  // Ripple, clipped to the button's rounded corners. Light on filled
  // buttons, primary-tinted on outline/ghost ones.
  const filled = props.variant !== 'outline' && props.variant !== 'ghost'
  const rippleColor = filled ? 0x33FFFFFF : (0x1F << 24) | (Number.parseInt(colors.primary.slice(1), 16) & 0xFFFFFF)
  const mask = new android.graphics.drawable.GradientDrawable()
  mask.setColor(0xFFFFFFFF | 0)
  mask.setCornerRadius(Utils.layout.toDevicePixels(radii.md))
  nativeView.setForeground(new android.graphics.drawable.RippleDrawable(
    android.content.res.ColorStateList.valueOf(rippleColor | 0),
    null,
    mask
  ))
}
</script>
