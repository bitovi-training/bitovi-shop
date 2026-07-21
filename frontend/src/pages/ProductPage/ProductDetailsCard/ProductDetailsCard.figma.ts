// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-290
// source=frontend/src/pages/ProductPage/ProductDetailsCard/ProductDetailsCard.jsx
// component=ProductDetailsCard
// Figma name: "Product Details"
// Note: The Figma "Property 1" variant (In Stock / Out of Stock) reflects
// product availability. In code this is derived from product.available_quantity.
import figma from 'figma'

export default {
  example: figma.code`<ProductDetailsCard product={product} onAddToCart={handleAddToCart} />`,
  imports: ['import ProductDetailsCard from "pages/ProductPage/ProductDetailsCard/ProductDetailsCard"'],
  id: 'product-details-card',
  metadata: { nestable: false },
}
