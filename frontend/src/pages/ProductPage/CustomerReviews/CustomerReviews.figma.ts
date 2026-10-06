// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=20-572
// source=frontend/src/pages/ProductPage/CustomerReviews/CustomerReviews.jsx
// component=CustomerReviews
// Note: CustomerReviews takes a `reviews` array at runtime. The Figma component
// shows a static layout with no configurable properties.
import figma from 'figma'

export default {
  example: figma.code`<CustomerReviews reviews={reviews} />`,
  imports: ['import CustomerReviews from "pages/ProductPage/CustomerReviews/CustomerReviews"'],
  id: 'customer-reviews',
  metadata: { nestable: false },
}
