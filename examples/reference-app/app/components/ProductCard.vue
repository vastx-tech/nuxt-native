<template>
  <NCard padding="md">
    <NFlex class="flex-col gap-2">
      <!-- @tap lives on this inner wrapper, not the NCard, and the
           NButton below is a sibling to it, not a descendant — nesting a
           tappable NButton inside an @tap-bearing ancestor was confirmed
           on a real device to fire BOTH handlers from one tap
           (NativeScript's tap gesture doesn't stop propagation to an
           ancestor's own separately-registered listener the way DOM
           events do), so "Add to cart" was also silently navigating away.
           Keeping the tap targets siblings avoids that entirely. -->
      <NFlex class="flex-col gap-2" @tap="$emit('tap')">
        <NText :text="product.name" variant="h3" weight="semibold" />
        <NText :text="product.description" variant="caption" color="#64748b" />
        <NText :text="price" variant="body" weight="semibold" />
      </NFlex>
      <NButton text="Add to cart" size="sm" @tap="$emit('add')" />
    </NFlex>
  </NCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../composables/useProducts'

const props = defineProps<{ product: Product }>()
defineEmits<{ tap: [], add: [] }>()

// A computed, not an inline formatCurrency() call in the template:
// formatCurrency() is auto-imported (no explicit import needed, same as
// any composable/util), but auto-import is a build-time webpack
// transform vue-tsc's standalone typecheck never sees — a name used only
// inside <template>, never referenced in <script>, isn't part of this
// component's known bindings from vue-tsc's point of view, so it would
// show a false "Cannot find name" here. Referencing it in <script>
// (as this computed does) resolves that, and is better practice anyway —
// computed properties are cached, an inline template call runs on every
// re-render.
const price = computed(() => formatCurrency(props.product.priceInCents))
</script>
