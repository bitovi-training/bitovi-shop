// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-143
// source=frontend/src/pages/ProductPage/CustomerReview/CustomerReview.jsx
// component=CustomerReview
// Figma name: "Customer Review"
import figma from 'figma'

const instance = figma.selectedInstance

// Figma stores the rating as star characters ("★★★★☆"); code takes a number.
const rating = (instance.getString('Rating').match(/★/g) || []).length
// Figma wraps the review in quote marks for display; code adds its own.
const review = instance.getString('Review').replace(/^["“”]+|["“”]+$/g, '')
const author = instance.getString('Name')

export default {
  example: figma.code`<CustomerReview rating={${rating}}${figma.helpers.react.renderProp('review', review)}${figma.helpers.react.renderProp('author', author)} />`,
  imports: ['import CustomerReview from "pages/ProductPage/CustomerReview/CustomerReview"'],
  id: 'customer-review',
  metadata: { nestable: false },
}
