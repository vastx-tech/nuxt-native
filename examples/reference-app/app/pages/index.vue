<template>
  <NPage title="Shop">
    <NFlex class="flex-col p-5 gap-4">
      <SectionHeader title="Featured gear" :subtitle="`${products.length} items`" />

      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @tap="openProduct(product.id)"
        @add="cart.addItem(product)"
      />

      <NButton
        :text="`View cart (${cart.itemCount})`"
        variant="outline"
        @tap="openCart"
      />
    </NFlex>
  </NPage>
</template>

<script setup lang="ts">
// useProducts(), useNativeRouter(), and useCartStore() below — the first
// two are auto-imported (nuxt-native's own + this project's own
// composable); ProductCard/SectionHeader (project components) and
// useCartStore (a Pinia store) are explicitly imported, matching the
// project's own documented scope for what auto-import does and doesn't
// cover — see this app's README.
import ProductCard from '../components/ProductCard.vue'
import SectionHeader from '../components/SectionHeader.vue'
import { useCartStore } from '../stores/cart'

const { products } = useProducts()
const { navigate } = useNativeRouter()
const cart = useCartStore()

function openProduct(id: string) {
  navigate('products_id', { params: { id } })
}

function openCart() {
  navigate('cart')
}
</script>
