<template>
  <NPage title="Product">
    <NFlex v-if="product" class="flex-col p-5 gap-4">
      <NText :text="product.name" variant="h2" weight="semibold" />
      <NText :text="product.description" variant="body" color="#64748b" />
      <NText :text="price" variant="h3" weight="semibold" />
      <NButton text="Add to cart" @tap="cart.addItem(product)" />
      <NButton text="Back" variant="outline" @tap="back" />
    </NFlex>
    <NFlex v-else class="flex-col p-5">
      <NText text="Product not found" variant="body" />
    </NFlex>
  </NPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'

const props = defineProps<{ id?: string }>()
const { getProduct } = useProducts()
const { back } = useNativeRouter()
const cart = useCartStore()

const product = getProduct(props.id ?? '')
const price = computed(() => (product ? formatCurrency(product.priceInCents) : ''))
</script>
