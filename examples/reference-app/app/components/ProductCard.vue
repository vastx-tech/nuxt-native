<template>
  <NCard padding="md" @tap="$emit('tap')">
    <NFlex class="flex-col gap-2">
      <NText :text="product.name" variant="h3" weight="semibold" />
      <NText :text="product.description" variant="caption" color="#64748b" />
      <NFlex class="flex-row items-center justify-between">
        <NText :text="price" variant="body" weight="semibold" />
        <NButton text="Add to cart" size="sm" @tap="$emit('add')" />
      </NFlex>
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
