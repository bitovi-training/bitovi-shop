// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-532
// source=frontend/src/pages/HomePage/FeaturedProductCard/FeaturedProductCard.jsx
// component=FeaturedProductCard
// Figma name: "Featured Product"
// Note: FeaturedProductCard takes a `product` data object. The Figma component
// exposes Name, Description, Price, and Show Stars as editable properties.
import figma from 'figma'

export default {
  example: figma.code`<FeaturedProductCard product={product} onAddToCart={handleAddToCart} />`,
  imports: ['import FeaturedProductCard from "pages/HomePage/FeaturedProductCard/FeaturedProductCard"'],
  id: 'featured-product-card',
  metadata: { nestable: false },
}
