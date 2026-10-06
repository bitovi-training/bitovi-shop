// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-290
// source=frontend/src/pages/ProductPage/ProductDetailsCard/ProductDetailsCard.jsx
// component=ProductDetailsCard
// Figma name: "Product Details"
// Code takes a `product` object, so the Figma properties are rendered as one.
// Show Stars is designed but not built in code yet.
import figma from 'figma'

const instance = figma.selectedInstance

const name = instance.getString('Name')
const description = instance.getString('Description')
const price = instance.getString('Price')
const priceCents = Math.round(parseFloat(String(price).replace(/[^0-9.]/g, '')) * 100) || 0
const inStock = instance.getEnum('Property 1', { 'In Stock': true, 'Out of Stock': false })
const inStockField = `, in_stock: ${inStock}`
const product = `{ name: ${JSON.stringify(name)}, description: ${JSON.stringify(description)}, price_cents: ${priceCents}${inStockField} }`

export default {
  example: figma.code`<ProductDetailsCard product={${product}} onAddToCart={handleAddToCart} />`,
  imports: ['import ProductDetailsCard from "pages/ProductPage/ProductDetailsCard/ProductDetailsCard"'],
  id: 'product-details-card',
  metadata: { nestable: false },
}
