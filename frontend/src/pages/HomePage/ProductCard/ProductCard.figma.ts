// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=12-420
// source=frontend/src/pages/HomePage/ProductCard/ProductCard.jsx
// component=ProductCard
// Figma name: "Product Card"
// Code takes a `product` object, so the Figma properties are rendered as one.
// Show Add to Cart has no prop: code shows the button whenever the product is in stock.
// Stars / Show Stars are designed (page "Feature — Product Card Rating") but not built in code yet.
import figma from 'figma'

const instance = figma.selectedInstance

const name = instance.getString('Name')
const description = instance.getString('Description')
const price = instance.getString('Price')
const priceCents = Math.round(parseFloat(String(price).replace(/[^0-9.]/g, '')) * 100) || 0
const inStock = !instance.getBoolean('Show Out of Stock')
const inStockField = `, in_stock: ${inStock}`
const product = `{ name: ${JSON.stringify(name)}, description: ${JSON.stringify(description)}, price_cents: ${priceCents}${inStockField} }`

export default {
  example: figma.code`<ProductCard product={${product}} onAddToCart={handleAddToCart} />`,
  imports: ['import ProductCard from "pages/HomePage/ProductCard/ProductCard"'],
  id: 'product-card',
  metadata: { nestable: false },
}
