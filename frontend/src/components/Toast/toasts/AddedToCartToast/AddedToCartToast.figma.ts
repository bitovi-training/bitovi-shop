// url=https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/Shop?node-id=150-800
// source=frontend/src/components/Toast/toasts/AddedToCartToast/AddedToCartToast.jsx
// component=AddedToCartToast
// Note: The Figma component has no configurable properties that map to code props.
// productName and imageSrc must be provided by the consuming code.
import figma from 'figma'

export default {
  example: figma.code`<AddedToCartToast productName="Product Name" imageSrc="/images/product.jpg" />`,
  imports: ['import AddedToCartToast from "components/Toast/toasts/AddedToCartToast/AddedToCartToast"'],
  id: 'added-to-cart-toast',
  metadata: { nestable: false },
}
