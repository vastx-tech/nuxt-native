export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

// Static/mock data for this reference app — a real app would replace this
// with a real fetch() call to a real backend. Nothing about the pattern
// below (a composable returning derived lookups over the data) changes
// once that swap happens.
const PRODUCTS: Product[] = [
  { id: '1', name: 'Trail Runner Jacket', description: 'Lightweight, packable, weatherproof.', priceInCents: 8900 },
  { id: '2', name: 'Insulated Bottle', description: 'Keeps drinks cold for 24 hours.', priceInCents: 2400 },
  { id: '3', name: 'Daypack 22L', description: 'A comfortable pack for day hikes.', priceInCents: 6500 }
]

export function useProducts() {
  const products = PRODUCTS

  function getProduct(id: string): Product | undefined {
    return products.find(product => product.id === id)
  }

  return { products, getProduct }
}
