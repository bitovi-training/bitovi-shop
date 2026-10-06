// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-532
// source=frontend/src/pages/HomePage/FeaturedProductCard/FeaturedProductCard.jsx
// component=FeaturedProductCard
// Figma name: "Featured Product"
// Code takes a `product` object, so the Figma properties are rendered as one.
// Show Stars is designed but not built in code yet.
import figma from 'figma'

const instance = figma.selectedInstance

const name = instance.getString('Name')
const description = instance.getString('Description')
const price = instance.getString('Price')
const priceCents = Math.round(parseFloat(String(price).replace(/[^0-9.]/g, '')) * 100) || 0
const inStockField = ''
const product = `{ name: ${JSON.stringify(name)}, description: ${JSON.stringify(description)}, price_cents: ${priceCents}${inStockField} }`

export default {
  example: figma.code`<FeaturedProductCard product={${product}} onAddToCart={handleAddToCart} />`,
  imports: ['import FeaturedProductCard from "pages/HomePage/FeaturedProductCard/FeaturedProductCard"'],
  id: 'featured-product-card',
  metadata: { nestable: false },
}
