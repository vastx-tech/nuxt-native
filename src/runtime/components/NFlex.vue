<template>
  <FlexboxLayout>
    <slot />
  </FlexboxLayout>
</template>

<script setup lang="ts">
// Intentionally no props here. NativeScript's FlexboxLayout already
// registers flex-direction/flex-wrap/justify-content/align-items/
// align-content/gap/row-gap/column-gap as real CSS properties scoped to
// this exact view class (confirmed against
// @nativescript/core/ui/layouts/flexbox-layout/flexbox-layout-common.js) —
// so Tailwind utility classes like `flex-col items-center justify-between
// gap-2` apply through the ordinary class/CSS cascade, the same way they
// would on web. This component exists only to give that primitive the
// same N-prefixed, auto-imported naming as the rest of the UI kit; adding
// direction/gap props here would just create a second, conflicting way to
// set the same thing.
</script>
