<template>
  <!-- scrollable="false": a <ListView> is its own scrolling, cell-
       recycling container (real view reuse — Android RecyclerView/iOS
       UITableView cell reuse under the hood, confirmed via
       recycleNativeView: 'auto' in list-view-common.js) — nesting it
       inside NPage's default ScrollView would force it to measure its
       full, unbounded content height to fit the outer scroller, which
       defeats recycling entirely (only ever renders a fixed few
       screen-fuls of cells if given a real bounded height instead). -->
  <NPage title="Shop" :scrollable="false">
    <NFlex class="flex-col p-5 gap-4" style="height: 100%">
      <SectionHeader title="Featured gear" :subtitle="`${products.length} items`" />

      <!-- flexGrow: 1 gives the list the header/button's leftover space
           in this flex column — the same real flex-item property
           flex()'s own `grow` option sets, just written inline here. -->
      <ListView :items="products" style="flexGrow: 1">
        <template #default="{ item }">
          <ProductCard
            :product="item"
            @tap="openProduct(item.id)"
            @add="cart.addItem(item)"
          />
        </template>
      </ListView>

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
