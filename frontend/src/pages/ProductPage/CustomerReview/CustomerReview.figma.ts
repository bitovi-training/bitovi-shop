// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=16-143
// source=frontend/src/pages/ProductPage/CustomerReview/CustomerReview.jsx
// component=CustomerReview
import figma from 'figma'

const instance = figma.selectedInstance

// Rating is a star-emoji text in Figma; code prop expects a number 0–5.
// Review text in Figma includes typographic quote characters that break Prettier,
// so the review is shown as a representative placeholder here.
const author = instance.getString('Name')

export default {
  example: figma.code`<CustomerReview rating={4} review="Great product, highly recommend!"${figma.helpers.react.renderProp('author', author)} />`,
  imports: ['import CustomerReview from "pages/ProductPage/CustomerReview/CustomerReview"'],
  id: 'customer-review',
  metadata: { nestable: false },
}
