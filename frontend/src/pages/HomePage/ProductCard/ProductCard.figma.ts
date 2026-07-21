// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=12-420
// source=frontend/src/pages/HomePage/ProductCard/ProductCard.jsx
// component=ProductCard
// Note: ProductCard takes a `product` data object. The Figma component exposes
// individual text fields (Name, Price, etc.) and booleans (Show Out of Stock,
// Show Add to Cart) but these are design-time values rather than direct code props.
import figma from 'figma'

export default {
  example: figma.code`<ProductCard product={product} onAddToCart={handleAddToCart} />`,
  imports: ['import ProductCard from "pages/HomePage/ProductCard/ProductCard"'],
  id: 'product-card',
  metadata: { nestable: false },
}
