<template>
  <NPage title="Cart">
    <NFlex class="flex-col p-5 gap-4">
      <NFlex v-if="cart.lines.length === 0" class="flex-col gap-2">
        <NText text="Your cart is empty" variant="body" color="#64748b" />
      </NFlex>

      <NFlex v-for="line in cart.lines" :key="line.product.id" class="flex-row items-center justify-between gap-2">
        <NText :text="`${line.product.name} x${line.quantity}`" variant="body" />
        <NFlex class="flex-row items-center gap-2">
          <NText :text="lineTotal(line)" variant="body" weight="semibold" />
          <NButton text="Remove" size="sm" variant="ghost" @tap="cart.removeItem(line.product.id)" />
        </NFlex>
      </NFlex>

      <NFlex v-if="cart.lines.length > 0" class="flex-row items-center justify-between">
        <NText text="Total" variant="h3" weight="semibold" />
        <NText :text="total" variant="h3" weight="semibold" />
      </NFlex>

      <NButton text="Back to shop" variant="outline" @tap="back" />
    </NFlex>
  </NPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const { back } = useNativeRouter()

// Referencing the auto-imported formatCurrency() here (not just inline in
// the template) is what lets vue-tsc's standalone typecheck resolve it —
// see ProductCard.vue's own comment for why. A per-line total can't be a
// single computed the way the cart's overall total below can (it depends
// on the v-for loop variable), so this is a plain function instead.
function lineTotal(line: { product: { priceInCents: number }, quantity: number }) {
  return formatCurrency(line.product.priceInCents * line.quantity)
}

const total = computed(() => formatCurrency(cart.totalInCents))
</script>
