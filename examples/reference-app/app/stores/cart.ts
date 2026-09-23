import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '../composables/useProducts'

interface CartLine {
  product: Product
  quantity: number
}

// Pinia stores are deliberately NOT auto-imported by nuxt-native (unlike
// composables/utils) — see auto-imports.mjs's own comment for why: a
// store file conventionally exports a name (`useCartStore`) that doesn't
// match its filename (`cart.ts`), which the filename-matching auto-import
// convention can't resolve safely. Import this one explicitly.
export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])

  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const totalInCents = computed(() => lines.value.reduce((sum, line) => sum + line.product.priceInCents * line.quantity, 0))

  function addItem(product: Product) {
    const existing = lines.value.find(line => line.product.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      lines.value.push({ product, quantity: 1 })
    }
  }

  function removeItem(productId: string) {
    lines.value = lines.value.filter(line => line.product.id !== productId)
  }

  return { lines, itemCount, totalInCents, addItem, removeItem }
})
