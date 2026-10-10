<!--
  Wraps @nativescript-community/ui-svg's real `<SVGView>` element — there
  is no SVG rendering in @nativescript/core itself. Optional: the native
  element is only registered (see generate-entry.mjs's isUiSvgInstalled())
  if the consuming app actually has @nativescript-community/ui-svg
  installed; this component still compiles fine without it (the <SVGView>
  tag name is resolved at runtime through nativescript-vue's own element
  registry, not a literal import here), it just throws a real, clear
  "unknown element" error if rendered without the dependency present.

  `src` accepts a `~/`-relative bundled file path, a URL, or — confirmed
  directly against @nativescript-community/ui-svg's real source
  (index.android.js/index.ios.js both fall through to
  SVG.getFromString()/SVGKSourceString.sourceFromContentsOfString() for
  any string that isn't a recognized file/resource path) — raw inline
  `<svg>...</svg>` markup, which is exactly what `resolveIconSvg()`
  (src/runtime/icons.ts) produces for NIconButton.
-->
<template>
  <SVGView :src="src" :stretch="stretch" />
</template>

<script setup lang="ts">
export interface NSvgProps {
  /** A `~/`-relative file path, a URL, or raw `<svg>...</svg>` markup. */
  src: string
  stretch?: 'none' | 'aspectFit' | 'aspectFill' | 'fill'
}

withDefaults(defineProps<NSvgProps>(), {
  stretch: 'aspectFit'
})
</script>
