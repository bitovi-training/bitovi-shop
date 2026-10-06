// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=21-563
// source=frontend/src/pages/HomePage/FeaturedProductHero/FeaturedProductHero.jsx
// component=FeaturedProductHero
// Note: FeaturedProductHero is a section wrapper around FeaturedProductCard.
// It has no configurable Figma properties.
import figma from 'figma'

export default {
  example: figma.code`<FeaturedProductHero product={product} onAddToCart={handleAddToCart} />`,
  imports: ['import FeaturedProductHero from "pages/HomePage/FeaturedProductHero/FeaturedProductHero"'],
  id: 'featured-product-hero',
  metadata: { nestable: false },
}
